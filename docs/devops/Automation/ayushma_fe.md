## `deploy.yml`

The `deploy.yml` workflow performs the following tasks:

1. **Trigger Events**:
   - The workflow is triggered by manual dispatch or pushes to the `production` branch.

2. **Checkout Code**:
   - Uses `actions/checkout@v3` to retrieve the repository's code.

3. **Generate Docker Metadata**:
   - Utilizes `docker/metadata-action@v4` to generate metadata and tags for the Docker image, including versioning based on the GitHub run number and semantic versioning patterns.

4. **Set Up Docker Buildx**:
   - Configures Docker Buildx with `docker/setup-buildx-action@v2` to enable advanced build capabilities.

5. **Cache Docker Layers**:
   - Caches Docker layers using `actions/cache@v3` to speed up build times. The cache key is based on `package.json` and the Dockerfile.

6. **Login to Docker Registries**:
   - Logs into DockerHub and GitHub Container Registry using `docker/login-action@v2`, with credentials provided via secrets.

7. **Run `pnpm`**:
   - Installs project dependencies using `pnpm`.

8. **Build and Push Docker Image**:
   - Uses `docker/build-push-action@v4` to build and push the Docker image, with caching for build layers and tagging as defined by the earlier metadata step.

9. **Update Cache**:
   - Manages the Docker build cache by replacing the old cache directory with the new one.

---
