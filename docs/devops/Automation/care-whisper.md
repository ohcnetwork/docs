## `deploy.yml`

The `deploy.yml` workflow performs the following tasks:

1. **Trigger Events**:
   - The workflow is triggered either manually via workflow dispatch or automatically by pushes to the `master` branch.

2. **Job `build-staging`**:
   - **Condition**: Runs only if the Git reference is `refs/heads/master`, ensuring it only executes for the `master` branch.
   - **Environment**: Runs on the latest Ubuntu environment.

   **Steps**:
   1. **Checkout Code**:
      - Uses `actions/checkout@v3` to check out the repository code.

   2. **Generate Docker Metadata**:
      - Uses `docker/metadata-action@v4` to generate Docker image metadata and tags. The tags include versions based on the GitHub run number and semantic versioning patterns.

   3. **Set Up Docker Buildx**:
      - Configures Docker Buildx with `docker/setup-buildx-action@v2` for advanced build capabilities.

   4. **Cache Docker Layers**:
      - Uses `actions/cache@v2` to cache Docker layers and speed up builds. The cache is based on `requirements.txt` and `Dockerfile`.

   5. **Login to GitHub Container Registry**:
      - Logs into GitHub Container Registry (`ghcr.io`) using `docker/login-action@v2` with credentials from secrets.

   6. **Build and Push Docker Image**:
      - Builds and pushes the Docker image using `docker/build-push-action@v3`, applying tags from the metadata step and leveraging the cache for efficiency.

   7. **Update Cache**:
      - Manages Docker build cache by replacing the old cache with the new one.

This workflow ensures that Docker images are built and pushed with appropriate tags, optimizing the build process with caching and updating the container registry as specified.
