---
sidebar_position: 1
slug: /
title: Contributing to Care
---

# Contributing to Care

Care is an open-source Electronic Medical Record (EMR) platform for managing patients, health workers, and hospitals. It is built and maintained in the open, and contributions of every kind are welcome — code, documentation, bug reports, and translations.

This guide is for developers who want to run Care locally, understand how it fits together, and submit changes back upstream.

:::tip New here?
If you're looking for product or operator documentation rather than the contributor workflow, start at the [core documentation home](/intro).
:::

## The two repositories

Care is split across two repositories under the [`ohcnetwork`](https://github.com/ohcnetwork) GitHub organization:

| Repository | Stack | What it is |
| --- | --- | --- |
| [`ohcnetwork/care`](https://github.com/ohcnetwork/care) | Django REST Framework (Python) | The backend — the API, data model, and business logic for patients, facilities, and users. |
| [`ohcnetwork/care_fe`](https://github.com/ohcnetwork/care_fe) | React + TypeScript | The frontend — the web application that talks to the backend API. |

The frontend is a separate app that points at a running backend, so most full-stack work involves running both repositories side by side.

## How this guide is organized

- **Local development** — get each side of the stack running on your machine:
  - [Backend setup](./local-development/backend.md) — the Django REST Framework API.
  - [Frontend setup](./local-development/frontend.md) — the React + TypeScript app.
  - [Nix dev environment](./local-development/nix.md) — a reproducible, all-in-one development shell.
- [**Plugins**](./plugins.md) — extend Care with pluggable apps without forking it.
- [**Contribution workflow**](./workflow.md) — branching, pull requests, reviews, and how changes get merged.

## Prerequisites

You should be comfortable with:

- **Git and GitHub** — cloning, branching, and opening pull requests.
- **Basic web development** — running a local dev server and editing application code.

You don't need prior healthcare-domain knowledge to make your first contribution. The local-development guides cover the language- and tooling-specific setup for each repository.

## Where to get help

- **Community Slack** — join the OHC community at [slack.ohc.network](https://slack.ohc.network) to ask questions and reach maintainers.
- **Good first issues** — browse issues labelled [`good first issue`](https://github.com/ohcnetwork/care/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [`help wanted`](https://github.com/ohcnetwork/care/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) for a curated starting point. Comment on an issue to let maintainers know you're picking it up.

:::note Code of Conduct
All participation in the Care community is governed by the [Contributor Covenant Code of Conduct](https://github.com/ohcnetwork/care/blob/develop/CODE_OF_CONDUCT.md). Please read it before contributing.
:::
