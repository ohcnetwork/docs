## `deployment.yaml`

The `deployment.yaml` workflow performs the following tasks:

1. **Trigger Events**:
   - The workflow is triggered by manual dispatch or pushes to the `master` and `production` branches.

2. **Checkout Code**:
   - Uses `actions/checkout` to retrieve the code from the repository.

3. **Generate Docker Metadata**:
   - Uses `docker/metadata-action` to generate Docker image metadata and tags based on the Git reference and run number, with specific tags for the `production` branch.

4. **Set Up Docker Buildx**:
   - Configures Docker Buildx for extended build capabilities.

5. **Cache Docker Layers**:
   - Uses `actions/cache` to cache Docker layers, speeding up subsequent builds.

6. **Login to Registries**:
   - Logs into DockerHub and GitHub Container Registry using credentials from secrets.

7. **Build and Push Docker Image**:
   - Uses `docker/build-push-action` to build the Docker image and push it to the specified registries with the previously defined tags.

8. **Update Docker Cache**:
   - Manages the Docker cache by moving the new cache directory to replace the old one.

---

## `linter.yaml`

The `linter.yaml` workflow performs the following tasks:

1. **Trigger Events**:
   - The workflow is triggered by pull requests targeting the `master` branch.

2. **Checkout Code**:
   - Uses `actions/checkout` to fetch the repository's code with full history (`fetch-depth: 0`).

3. **Lint Code Base**:
   - Runs `super-linter` with configurations for Python linters such as `black`, `flake8`, and `isort`, based on settings in `setup.cfg` and `pyproject.toml`.
   - The linter runs with `DEFAULT_BRANCH` set to `master`, and the `GITHUB_TOKEN` is provided for GitHub authentication.

This workflow ensures that the codebase is linted according to the specified rules and configurations before merging pull requests into the `master` branch.

---

## `test-base.yaml`

The `test-base.yaml` workflow performs the following tasks:

1. **Checkout Code**:
   - Uses `actions/checkout` to retrieve the repository's code.

2. **Set Up Docker Buildx**:
   - Configures Docker Buildx using `docker/setup-buildx-action` for advanced build capabilities.

3. **Cache Docker Layers**:
   - Caches Docker build layers using `actions/cache`, with a cache key based on `Pipfile.lock` and Dockerfile, and restore keys for fallback.

4. **Bake Docker Images**:
   - Builds Docker images using `docker/bake-action`, reading configuration from `docker-compose.local.yaml` and optimizing build times with layer caching.

5. **Start Services**:
   - Uses Docker Compose to start services defined in `docker-compose.local.yaml`, waiting for them to be fully operational.

6. **Check Migrations**:
   - Runs `make checkmigration` to verify database migrations.

7. **Move Cache**:
   - Updates the Docker build cache by moving the new cache directory to replace the old one.

---

## `test.yaml`

The `test.yaml` workflow performs the following tasks:

1. **Trigger Events**:
   - The workflow is triggered by pull request events.

2. **Use Reusable Workflow**:
   - Includes a single job named `test` that utilizes a reusable workflow defined in `./.github/workflows/test-base.yaml`.

This setup allows the "Test PR" workflow to leverage the configurations and steps defined in the `test-base.yaml` file, ensuring consistency and efficiency across different workflows.
