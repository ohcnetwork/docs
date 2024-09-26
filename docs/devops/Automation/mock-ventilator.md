## `docker-image.yml`

The `docker-image.yml` workflow is designed for building and pushing Docker images to the GitHub Container Registry when changes are pushed to or pull requests are opened against the `master` branch. The workflow consists of a single job:

### Build Job

1. **Check Out Code**: Checks out the repository's code using the `actions/checkout@v3` action.

2. **Generate Docker Metadata**:
   - Uses the `docker/metadata-action@v4` action to generate metadata for the Docker image.
   - Tags the image with:
     - `latest`
     - `latest` with the GitHub run number appended
     - Semantic version tags based on the Git reference.
   - Ensures the `latest` tag is always present.

3. **Login to GitHub Container Registry**:
   - Logs into the GitHub Container Registry (`ghcr.io`) using the `docker/login-action@v2` action.
   - Authentication is handled using the GitHub actor and the `GITHUB_TOKEN` secret.

4. **Build and Push Docker Image**:
   - Builds the Docker image using the `docker/build-push-action@v3` action.
   - Pushes the Docker image to the GitHub Container Registry with the tags generated in the previous step.

This workflow automates the process of building and pushing Docker images to the GitHub Container Registry upon updates to the `master` branch, ensuring that the images are consistently tagged and available for deployment or use.
