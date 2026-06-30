---
sidebar_position: 2
title: Frontend setup
---

# Frontend setup

This guide walks you through running the Care frontend ([`ohcnetwork/care_fe`](https://github.com/ohcnetwork/care_fe)) on your machine. The frontend is a React + TypeScript single-page app built with Vite.

## Prerequisites

- **Node.js** — the repository pins the runtime to **Node 22** via its `.node-version` file. If you use a version manager such as [`nodenv`](https://github.com/nodenv/nodenv) or [`fnm`](https://github.com/Schniz/fnm), it will pick this up automatically; otherwise install a matching Node 22 release.
- **npm** — ships with Node and is the package manager used by this project (the repo tracks a `package-lock.json`).
- **A running Care backend** — the frontend needs an API to talk to. Set up the backend first by following [Backend local setup](./backend.md).

:::note
The repo does not declare an `engines` field in `package.json`, so npm will not block other Node versions. Stick to the version in `.node-version` to match CI.
:::

## Install dependencies

From the root of your `care_fe` clone:

```bash
npm install
```

This also runs the project's `postinstall` step, which installs platform-specific dependencies and generates HTTP headers.

## Point the frontend at your backend

Create a `.env.local` file in the project root and set the API URL to your local backend:

```env
# Point the frontend to your local backend
REACT_CARE_API_URL=http://127.0.0.1:9000
```

The backend from [Backend local setup](./backend.md) listens on port `9000`, which is what the URL above expects. Make sure the backend is running and has dummy data loaded before you sign in.

## Run the development server

```bash
npm run dev
```

Once the dev server is up, open [http://localhost:4000](http://localhost:4000) in your browser. The page reloads automatically when you save edits, and lint errors surface in the terminal.

:::tip
After loading dummy data into your local backend, you can sign in with the seeded development credentials documented in the backend setup. If sign-in fails, confirm the backend is reachable at the `REACT_CARE_API_URL` you configured.
:::

## npm scripts that matter

These are the scripts contributors reach for most often. All are defined in `package.json`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server at `http://localhost:4000` with hot reload. |
| `npm run build` | Build the production bundle into the `build` folder. |
| `npm run preview` | Serve the production build locally (with the service worker). |
| `npm run lint` | Run ESLint over `src`. |
| `npm run lint-fix` | Run ESLint over `src` and auto-fix what it can. |
| `npm run format` | Format `src` and `tests` with Prettier. |
| `npm run test` | Run a Snyk dependency scan (this is what `test` maps to; end-to-end tests use the `playwright:*` scripts). |

:::note
There is no unit-test runner wired into `npm run test`. The functional test suite runs through Playwright via the `playwright:*` scripts (for example `npm run playwright:test`). Setting those up requires a local backend with dummy data — see the repository's README and `tests/` directory for details.
:::

## Opening a pull request

A few conventions from the frontend repo's README, in brief:

- **Claim the issue** by commenting on it before you start, and link your pull request to the issue.
- **Tag `@ohcnetwork/care-fe-code-reviewers`** on your pull request for a faster review.
- **Attach screenshots** of any UI changes so reviewers can see the result without checking out your branch.

For the full branch-naming, commit, and review process that applies across Care repos, see the [Contribution workflow](../workflow.md).
