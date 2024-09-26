| **Workflow File** | **Description** |
|-------------------|-----------------|
| `docker-image.yml` |  Builds and pushes Docker images for the mock CNS request service. |

## `docker-image.yml`

The `docker-image.yml` workflow is set up to automatically build and push Docker images to the GitHub Container Registry whenever there are changes pushed to the `master` branch or when a pull request is made against it. The workflow includes one job:

### Build Job

1. **Check Out the Repository**:
   - The workflow starts by checking out the repository’s code using the `actions/checkout@v3` action, ensuring that the latest code is available for building the Docker image.

2. **Generate Docker Metadata**:
   - Utilizes the `docker/metadata-action@v4` action to create metadata for the Docker image.
   - Tags the image with:
     - `latest` to signify the most recent build.
     - `latest` appended with the GitHub run number to distinguish builds.
     - Semantic versioning tags derived from the Git reference for version management.
   - Ensures the `latest` tag is always created.

3. **Authenticate with GitHub Container Registry**:
   - Logs into the GitHub Container Registry (`ghcr.io`) using the `docker/login-action@v2` action.
   - Authentication credentials are managed using the GitHub actor and the `GITHUB_TOKEN` secret to securely push the image.

4. **Build and Push Docker Image**:
   - Builds the Docker image based on the `Dockerfile` present in the repository using the `docker/build-push-action@v3` action.
   - Pushes the built image to the GitHub Container Registry with the tags generated during the metadata step.

This workflow streamlines the process of continuously building and deploying Docker images, ensuring that the latest version is always available in the GitHub Container Registry whenever changes are made to the `master` branch.
