
## `docker-image.yml`

The `docker-image.yml` workflow manages Docker image testing, building, and pushing for different branches. It includes three main jobs:

### Test Job

1. **Trigger**: Runs on pull requests to `develop` and `master` branches.
2. **Check Out Code**: Checks out the repository's code.
3. **Set up Docker Buildx**: Configures Docker Buildx for multi-platform builds.
4. **Cache Docker Layers**: Caches Docker build layers to speed up subsequent builds.
5. **Test Build**: Builds the Docker image without pushing it.
6. **Run Tests**: Placeholder step for running tests (currently just an echo command).
7. **Move Cache**: Updates the Docker cache to optimize future builds.

### Build & Push Staging Image

1. **Trigger**: Runs on pushes to the `develop` branch.
2. **Check Out Code**: Checks out the repository's code.
3. **Docker Metadata**: Generates Docker image metadata, including tags based on the branch, run number, date, and commit SHA.
4. **Set up Docker Buildx**: Configures Docker Buildx for multi-platform builds.
5. **Cache Docker Layers**: Caches Docker build layers to optimize the build process.
6. **Login to GitHub Container Registry**: Authenticates with the GitHub Container Registry using GitHub credentials.
7. **Build & Push Image**: Builds and pushes the Docker image to the GitHub Container Registry.
8. **Move Cache**: Updates the Docker cache to optimize future builds.

### Build & Push Production Image

1. **Trigger**: Runs on pushes to the `master` branch.
2. **Check Out Code**: Checks out the repository's code.
3. **Docker Metadata**: Generates Docker image metadata, including tags based on the branch, run number, date, and commit SHA.
4. **Set up Docker Buildx**: Configures Docker Buildx for multi-platform builds.
5. **Cache Docker Layers**: Caches Docker build layers to optimize the build process.
6. **Login to GitHub Container Registry**: Authenticates with the GitHub Container Registry using GitHub credentials.
7. **Build & Push Image**: Builds and pushes the Docker image to the GitHub Container Registry.
8. **Move Cache**: Updates the Docker cache to optimize future builds.

---

## `spoke-infra-deploy.yml`

The `spoke-infra-deploy.yml` workflow deploys infrastructure to different environments using Docker Compose. It includes several deployment jobs for different locations, each following a similar structure:

### MN JNIMS Deployment

1. **Trigger**: Runs on pushes to the `master` branch or when manually triggered.
2. **Check Out Code**: Checks out the repository's code.
3. **Run Script File**:
   - Sets environment variables from secrets.
   - Copies the `docker-compose.yaml` file to the deployment directory.
   - Runs `docker-compose up -d` to deploy the infrastructure.

### MN Churachandpur Deployment

1. **Trigger**: Runs on pushes to the `master` branch or when manually triggered.
2. **Check Out Code**: Checks out the repository's code.
3. **Run Script File**:
   - Sets environment variables from secrets.
   - Copies the `docker-compose.yaml` file to the deployment directory.
   - Runs `docker-compose up -d` to deploy the infrastructure.

### MN Tamenglong Deployment

1. **Trigger**: Runs on pushes to the `master` branch or when manually triggered.
2. **Check Out Code**: Checks out the repository's code.
3. **Run Script File**:
   - Sets environment variables from secrets.
   - Copies the `docker-compose.yaml` file to the deployment directory.
   - Runs `docker-compose up -d` to deploy the infrastructure.

### MN Chandel Deployment

1. **Trigger**: Runs on pushes to the `master` branch or when manually triggered.
2. **Check Out Code**: Checks out the repository's code.
3. **Run Script File**:
   - Sets environment variables from secrets.
   - Copies the `docker-compose.yaml` file to the deployment directory.
   - Runs `docker-compose up -d` to deploy the infrastructure.

### MN Ukhrul Deployment

1. **Trigger**: Runs on pushes to the `master` branch or when manually triggered.
2. **Check Out Code**: Checks out the repository's code.
3. **Run Script File**:
   - Sets environment variables from secrets.
   - Copies the `docker-compose.yaml` file to the deployment directory.
   - Runs `docker-compose up -d` to deploy the infrastructure.

### MN Thoubal Deployment

1. **Trigger**: Runs on pushes to the `master` branch or when manually triggered.
2. **Check Out Code**: Checks out the repository's code.
3. **Run Script File**:
   - Sets environment variables from secrets.
   - Copies the `docker-compose.yaml` file to the deployment directory.
   - Runs `docker-compose up -d` to deploy the infrastructure.
