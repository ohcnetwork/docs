---
sidebar_position: 1
title: Backend setup
---

# Backend setup

This page walks you through running the Care backend ([ohcnetwork/care](https://github.com/ohcnetwork/care)) on your machine. It is a Django application that exposes the Care REST API and depends on PostgreSQL, Redis, a Celery worker, and an S3-compatible object store (MinIO locally).

There are two supported paths:

- **Docker Compose** (recommended) — every dependency runs in a container, so there are no conflicting local installs.
- **Manual / virtualenv** — you run Django directly against a PostgreSQL and Redis you provide yourself.

Most contributors should use Docker Compose. Use the manual path only if you cannot run Docker, or you need to attach native tooling.

:::tip
The default branch for contributions is `develop`. Clone and base your work on it. See the [contribution workflow](../workflow.md) for branching and PR conventions.
:::

## Docker Compose (recommended)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- Docker Compose (bundled with Docker Desktop)

The Compose stack runs the following containers:

| Container | Role |
| --- | --- |
| `backend` | Care Django application (serves the API) |
| `db` | PostgreSQL database |
| `redis` | In-memory cache and Celery broker |
| `celery` | Background task worker |
| `minio` | S3-compatible object store (mimics AWS locally) |

### 1. Build the images

```bash
make build
```

The first build pulls base images and installs dependencies, so it can take a while depending on your machine and network speed.

### 2. Start the stack

```bash
make up
```

This starts all containers in the background and waits for them to become healthy. Once it returns, the API is available at [http://localhost:9000](http://localhost:9000).

:::tip
To attach the VS Code debugger, set `DJANGO_DEBUG=True` in your `.env` file before starting the stack.
:::

### 3. Seed data

Load the fixtures (base roles, permissions, and reference data) so the app is usable:

```bash
make load-fixtures
```

### 4. Create an admin user

```bash
docker compose exec backend python manage.py createsuperuser
```

Follow the prompts to set the username, email, and password. You can now sign in to the API and (with the [frontend](./frontend.md) running) the web app.

### Running tests

Run the full test suite:

```bash
make test
```

Run a single test file, class, or method by passing a dotted `path`:

```bash
make test path=<dotted.path>
```

### Stopping and resetting

```bash
# Stop and remove containers, keeping your data volumes
make down

# Stop and remove containers AND their volumes (wipes the database)
make teardown
```

### After changing dependencies or migrations

Whenever you update a Python dependency or add a migration that must run inside the container, rebuild the image without cache:

```bash
make re-build
```

:::note
`make re-build` rebuilds with `--no-cache`, so it is slower than `make build`. Use it specifically when a plain `make up` no longer reflects your dependency or migration changes.
:::

## Manual / virtualenv setup

Use this path only if you are not using Docker. You are responsible for running PostgreSQL and Redis yourself.

### 1. Provision PostgreSQL

Create a role and database. For example, in `psql`:

```sql
CREATE ROLE my_username LOGIN PASSWORD 'my_password';
CREATE DATABASE care WITH OWNER = my_username;
```

### 2. Create a virtual environment and install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pipenv sync --categories "packages dev-packages docs"
```

### 3. Configure environment

Put your database connection string in a `.env` file at the repository root:

```env
DATABASE_URL=postgres://my_username:my_password@localhost:5432/care
```

Tell Django to read it:

```bash
export DJANGO_READ_DOT_ENV_FILE=true
```

### 4. Migrate and run

```bash
python manage.py migrate
python manage.py runserver
```

Seed data and create an admin user the same way as in the Docker path, but run the commands directly:

```bash
python manage.py load_fixtures
python manage.py createsuperuser
```

Run the test suite with:

```bash
python manage.py test
```

:::note macOS troubleshooting
If you installed PostgreSQL via [Postgres.app](https://postgresapp.com/), add its binaries to your `PATH` so `psql` and friends are found (adjust the version to match your install):

```bash
export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/14/bin
```

If `pipenv sync` fails while building Pillow, install its native image libraries first:

```bash
brew install libjpeg libtiff little-cms2 openjpeg webp freetype harfbuzz fribidi
```
:::

## Pre-commit hooks

Care uses [pre-commit](https://pre-commit.com/) to run linters and formatters before each commit. Install the hooks once after cloning:

```bash
pre-commit install
```

To run the hooks against only the files you have changed relative to `develop`:

```bash
pre-commit run --files $(git diff --name-only develop...HEAD)
```

## Useful `make` targets

These targets are defined in the repository's `Makefile` and wrap the most common Docker Compose workflows.

| Target | What it does |
| --- | --- |
| `make build` | Build the Docker images |
| `make re-build` | Rebuild the images with `--no-cache` (after dependency or migration changes) |
| `make up` | Start the stack in the background and wait until healthy |
| `make down` | Stop and remove containers, keeping volumes |
| `make teardown` | Stop and remove containers and volumes (wipes data) |
| `make load-fixtures` | Load seed/reference data into the database |
| `make migrate` | Apply database migrations |
| `make makemigrations` | Generate new migrations from model changes |
| `make test` | Run the test suite (pass `path=<dotted.path>` for one test) |
| `make logs` | Show logs for the stack |
| `make reset-and-setup` | Reset the database, then migrate and reload fixtures |

## Next steps

- Set up the [frontend](./frontend.md) to use the web app against this API.
- Prefer a reproducible toolchain? See the [Nix dev environment](./nix.md).
- Ready to contribute? Read the [contribution workflow](../workflow.md).
