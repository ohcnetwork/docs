
## `main.yml`

The `main.yml` workflow consists of the following steps:

1. **Check Out Code**: Checks out the repository's code.
2. **Check for Docker Compose File**:
   - If `docker-compose.test.yml` is present, it builds and runs tests using Docker Compose.
   - If the file is not present, it builds the Docker image using a Dockerfile.
3. **Environment Variable**: `IMAGE_NAME` is set to `arike-main`, though it is not explicitly used in the workflow.

---

## `Production.yml`

The `Production.yml` workflow is composed of three main jobs:

### Test Job

1. **Check Out Code**: Checks out the code from the repository.
2. **Run Tests**:
   - Uses Docker Compose if `docker-compose.test.yml` is found.
   - Falls back to a Docker build using a Dockerfile if the Docker Compose file is not present.

### Push Job

1. **Build Docker Image**: Builds the Docker image tagged with the `IMAGE_NAME` environment variable.
2. **Log In to Docker Registry**: Logs into the Docker registry.
3. **Push Docker Image**: Pushes the Docker image to the registry.
4. **Create Version Tags**:
   - Tags the image based on the Git reference.
   - Handles both tag and branch names appropriately.
   - Pushes all tags to the registry.

### Deploy Job

1. **Deploy Docker Image**: Deploys the Docker image to a remote server using SSH.
2. **Manage Existing Container**:
   - Stops and removes the existing Docker container.
   - Pulls the new image.
   - Runs the new Docker container with specified environment variables.
3. **Restart Nginx**: Restarts Nginx on the server to apply the changes.

---

## `staging.yml`

The `staging.yml` workflow is triggered by pushes and pull requests to the `staging` branch. It operates in an Ubuntu environment and includes three main jobs:

### Test Job

1. **Check Out Code**: Checks out the code from the repository.
2. **Build and Test**:
   - Uses Docker Compose if `docker-compose.test.yml` is present.
   - Falls back to a Docker build using a Dockerfile if the Docker Compose file is not present.

### Push Job

1. **Build Docker Image**: Builds the Docker image with the tag specified in the `IMAGE_NAME` environment variable.
2. **Log In to Docker Registry**: Logs into the Docker registry using a GitHub token.
3. **Push Docker Image**: Pushes the Docker image to the registry.
4. **Tag Image**: Tags the image with both the version extracted from the Git reference and a `latest` tag if applicable.

### Deploy Job

1. **Deploy Docker Image**: Deploys the Docker image to a staging server via SSH.
2. **Manage Staging Container**:
   - Stops and removes the existing staging container.
   - Pulls the new image.
   - Runs the new Docker container with environment variables specified in a file.
3. **Restart Nginx**: Restarts Nginx on the server to apply the changes.

---
