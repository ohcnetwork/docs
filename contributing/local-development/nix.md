---
sidebar_position: 3
title: Nix environment
---

# Nix development environment

Nix is an alternative to Docker Compose for backend development. Instead of running
PostgreSQL, Redis, and MinIO inside containers, the Nix dev shell installs pinned versions of
those services (and Python, ruff, and the build toolchain) from the Nix store and runs them
directly on your host. Service data lives in a project-local `.nix-data/` directory.

If you would rather use the standard Docker-based workflow, see the
[backend setup guide](./backend.md).

:::note
This environment is for backend (`care`) development. It targets macOS and non-NixOS Linux —
the automated setup script intentionally refuses to run on NixOS, which should use
NixOS-specific configuration instead.
:::

## Prerequisites

1. **Install Nix.** The Determinate Systems installer is preferred — it provides a cleaner
   install and hassle-free uninstallation:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
   ```

2. **Enable flakes.** Modern installers enable flakes automatically. If yours did not, add the
   following to `~/.config/nix/nix.conf`:

   ```text
   experimental-features = nix-command flakes
   ```

3. **Optional — install direnv** for automatic shell activation when you `cd` into the repo:

   ```bash
   # macOS (Homebrew)
   brew install direnv

   # Linux (varies by distribution)
   sudo apt install direnv   # Ubuntu/Debian
   sudo dnf install direnv   # Fedora
   ```

   Then, from the repo root:

   ```bash
   echo "use flake" > .envrc
   direnv allow
   ```

## Automated setup

For a first-time setup, run the setup script from the repo root:

```bash
./scripts/nix-dev-setup.sh
```

The script checks that Nix is installed and flakes are enabled, creates the Python virtual
environment and installs dependencies, starts the services (PostgreSQL, Redis, MinIO), runs
migrations, and optionally loads sample fixtures.

## Quick start (manual)

To set things up by hand, enter the dev shell and run the in-shell commands:

```bash
nix develop
setup-dev
start-services
rundev
```

This enters the development environment, installs Python dependencies into a `.venv`, starts the
background services, runs migrations, and launches the unified development server (Django API
plus Celery worker).

:::tip
Background services persist between shell sessions. On later days you usually only need
`nix develop`, then `start-services` (if not already running), then `rundev`.
:::

## In-shell commands

Once you are inside the dev shell (`nix develop`), these commands are on your `PATH`:

| Group | Command | Description |
| --- | --- | --- |
| Services | `start-services` | Start PostgreSQL, Redis, and MinIO |
| Services | `stop-services` | Stop the background services only |
| Services | `kill-care` | Stop all development processes and services |
| Server | `rundev` | Start the API server and Celery worker together (recommended) |
| Server | `runserver` | Start the Django development server only |
| Server | `celery` | Start the Celery worker with beat scheduler only |
| Database | `migrate` | Run database migrations |
| Database | `load-fixtures` | Load sample data |
| Database | `reset-db` | Drop and recreate the database |
| Testing | `test` | Run the test suite (reuses the database) |
| Testing | `test-coverage` | Run tests and produce a coverage report |
| Quality | `ruff` | Lint and fix staged Python files |
| Quality | `ruff-all` | Lint all Python files |

:::note
Additional helpers are available in the shell, including `makemigrations`, `manage <command>`,
`dump-db`, `load-db`, `clean-data`, `healthcheck`, `test-no-keep`, and `ruff-fix-all`. The dev
shell prints the full list when you enter it.
:::

## Service URLs

After `start-services` and `rundev` are up:

| Service | URL / address | Notes |
| --- | --- | --- |
| Django application | http://localhost:9000 | API and admin |
| MinIO console | http://localhost:9001 | S3-compatible object storage UI |
| PostgreSQL | `localhost:5432` | Database |
| Redis | `localhost:6379` | Cache and Celery broker |

:::info
Default development credentials (for example the MinIO and database logins) are set
automatically by the dev shell and are intended for local use only. Services bind to localhost
and are not reachable externally.
:::

## How it differs from Docker

The Nix workflow produces the same database schema, migrations, and Python dependency versions
as the Docker setup — the two can coexist. The main differences:

- **Services run on the host**, not inside containers, so there is no container overhead and
  startup is faster.
- **Data lives in `.nix-data/`** (`postgres/`, `redis/`, `minio/`) instead of Docker volumes.
  This directory is added to `.gitignore` automatically.
- **Commands run directly** in the shell — there is no `docker compose exec` indirection.
- **Versions are pinned** by the flake (for example Python 3.13 and PostgreSQL 15 from the Nix
  store), so the toolchain is reproducible across machines.
