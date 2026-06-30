---
sidebar_position: 3
title: Plugin system
---

# Plugin system

Care is designed to be extended without forking the core. Functionality you do not
want to maintain in the main codebase — a transcription service, a custom integration,
a bespoke UI — ships as a **plugin**. There are two halves to the system:

- **Backend plugs** — Django apps loaded into the [`care`](https://github.com/ohcnetwork/care)
  server through `plug_config.py`.
- **Frontend Care Apps** — federated React bundles loaded into the
  [`care_fe`](https://github.com/ohcnetwork/care_fe) host at runtime.

A plugin can be backend-only, frontend-only, or both, depending on what it needs to do.

## Backend plugs

A backend plugin is a regular Django app. What makes it a Care plugin is that it is
declared in `plug_config.py` using the `Plug` and `PlugManager` classes from the `plugs`
package. The default Care image ships with **no** plugins enabled — `plug_config.py`
declares an empty list — and you opt in by overriding that file with your own.

```python
from plugs.manager import PlugManager
from plugs.plug import Plug

my_plugin = Plug(
    name="my_plugin",
    package_name="git+https://github.com/octo/my_plugin.git",
    version="@v1.0.0",
    configs={
        "SERVICE_API_KEY": "my_api_key",
        "SERVICE_SECRET_KEY": "my_secret_key",
        "VALUE_1_MAX": 10,
    },
)

plugs = [my_plugin]

manager = PlugManager(plugs)
```

Each `Plug` points at a `package_name` (here a Git source) and a `version`, and carries a
`configs` dictionary that is passed to the plugin.

### Load timing: build vs runtime

Plugins can be installed either while the Docker image is being **built** or at **runtime**.
Build-time loading is recommended — it bakes the plugin and its dependencies into the image
so containers start with a known, reproducible set of plugins rather than resolving packages
on boot.

### Config precedence

Every plugin defines its own configuration variables, usually with sensible defaults, and
may read values from the environment. When the same value is set in more than one place,
Care resolves it in this order (highest priority first):

1. Values defined in `plug_config.py` (the `configs` dictionary on the `Plug`).
2. Environment variables.
3. Default values defined inside the plugin.

So `plug_config.py` always wins, environment variables fill the gaps, and the plugin's own
defaults are the fallback.

### URL mounting

The `PlugManager` automatically wires up each plugin's configuration and mounts its URLs
under `/api/<plugin-name>/`. A plugin named `my_plugin` therefore exposes its routes under
`/api/my_plugin/`.

### Scaffolding a new plug

A backend plugin follows the structure of a typical Django app — you define your models,
views, and URLs inside the plugin folder. To start from a working skeleton, use the
[care-plugin-cookiecutter](https://github.com/ohcnetwork/care-plugin-cookiecutter) template
rather than wiring everything up by hand.

### Local development

For local work, install the plugin in editable mode so your source edits are picked up
without reinstalling:

```bash
pip install -e /path/to/plugin
```

If the plugin needs to inherit components from the core app, install Care itself in editable
mode from inside the plugin:

```bash
pip install -e /path/to/care
```

:::tip
Set up the Care backend first — see [Backend local setup](./local-development/backend.md)
for getting the server running before you attach a plugin to it.
:::

## Frontend Care Apps

On the frontend, a plugin is called a **Care App**: a separately built React bundle that the
`care_fe` host loads at runtime via Vite module federation. The host app is the federation
`core` and shares key dependencies — `react`, `react-dom`, `react-i18next`,
`@tanstack/react-query`, `raviger`, `sonner`, `decimal.js` — so a plugin reuses the host's
single copy of each rather
than bundling its own. Each Care App exposes a `./manifest` (from `src/manifest.tsx`) that
declares the routes, components, tabs, and overrides it contributes; `src/pluginTypes.ts` in
`care_fe` is the source of truth for that manifest contract.

### How Care Apps are discovered

The host resolves its effective plugin set from two sources and merges them:

| Source | Where it comes from | Behavior |
| --- | --- | --- |
| Build-time | `REACT_ENABLED_APPS` env var, parsed into `careConfig.careApps` | Always enabled, read-only in the admin UI |
| API | `GET /api/v1/plug_config/` | Editable in the admin UI |

Build-time entries act as the base set, so they load even if the backend returns no matching
`plug_config` row. When both sources define the same plugin, the build-time entry wins for
overlapping metadata and non-conflicting API metadata is preserved. Each `REACT_ENABLED_APPS`
entry takes the form `org/repo` or `org/repo@host/path/to/remoteEntry.js`; when the host/path
is omitted, Care defaults to GitHub Pages at `https://{org}.github.io/{repo}`.

For each resolved plugin, the host validates the remote URL, registers the remote with Vite
federation under the plugin's slug, loads its `./manifest`, and exposes the loaded manifests
through `CareAppsContext`. If a remote is missing or fails to load, that plugin is logged and
skipped — the rest of the app and other plugins keep working.

### Local development

The recommended way to develop a Care App is **in-tree**: drop or symlink your plugin checkout
into the host's `apps/` directory so its manifest lives at `apps/<slug>/src/manifest.tsx`, then
run the host dev server:

```bash
npm run dev
```

The host's `localPluginDevSupport()` (in `vite.config.mts`) auto-discovers every
`apps/*/src/manifest.tsx`, wires each plugin directly into the host's own Vite module graph,
and serves its static assets — no separate build, no `vite preview`, and no `REACT_ENABLED_APPS`
entry needed. Editing plugin source hot-reloads through the host; adding or removing a manifest
triggers a full reload. Because dependencies are shared and deduplicated, you avoid duplicate
React copies and the hook-order errors they cause.

When you need to exercise the real federated `remoteEntry.js` loading path (for example, to test
the production flow), run the plugin standalone as a remote and point the host at it via
`REACT_ENABLED_APPS`. In this mode there is no automatic HMR back to the host — the host only
reloads after a plugin rebuild produces a fresh `remoteEntry.js`.

:::tip
To reuse a host component inside a plugin, `care_fe` ships a `clone-component` CLI
(`scripts/clone-component.ts`, `npm run clone-component`) that copies a component and every
local file it transitively imports into your plugin's `src/` tree, rewriting host path aliases
as it goes. Cloned files are independent copies and do not stay in sync with the host.
:::

### Override architecture

Care Apps can change host UI without the host code knowing about them, through an **override**
system. The mental model: instead of a component rendering itself, it asks the system what it
should be and renders that.

- Components opt in by wrapping their export with `register("ComponentName", Component)`. Usage
  does not change — call sites still render the component normally.
- The host computes a **resolution map** once and serves most lookups from it, keeping
  per-component resolution close to O(1). Overrides can be context-aware (page, role, position
  in the render tree), with a slower stack-aware path reserved for the rare cases that need it.
- A plugin registers its overrides through its manifest, letting it inject or replace behavior
  without breaking existing call sites.

:::note
The override design note in `care_fe` (`docs/care-apps-override-architecture.md`) is a
design-intent document. The authoritative, shipped implementation lives in
`care_fe/src/lib/override/` (`register.ts`, `registry.ts`, `bridge.ts`, `types.ts`); where the
note and the code disagree, the code wins.
:::

## Example plugin

[Care Scribe](https://github.com/ohcnetwork/care_scribe) is a published plugin that provides
autofill functionality for the Care consultation forms. It is a useful reference for how a real
plugin is structured across the backend and frontend.
