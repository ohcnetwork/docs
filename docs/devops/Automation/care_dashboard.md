## `deploy.yml`

### Overview

The `deploy.yml` GitHub Actions workflow is designed to deploy Docker images to different Google Kubernetes Engine (GKE) clusters based on pushes to the `production` branch or manual triggers. The workflow includes multiple jobs to build Docker images and deploy them to specific environments.

### Trigger Events

- **Push Events**: Triggers the workflow when changes are pushed to the `production` branch.
- **Pull Request Events**: Triggers the workflow when pull requests are made to the `production` branch.
- **Manual Dispatch**: Allows manual triggering of the workflow via GitHub Actions' UI.

### Environment Variables

- **`IMAGE_NAME`**: Set to `care-dashboard`, used for Docker image tagging.

### Jobs

#### 1. **Test**

- **Purpose**: Runs tests on the Docker build to ensure everything is working correctly.
- **Condition**: Only runs for pull request events.
- **Steps**:
  - **Checkout Code**: Uses `actions/checkout@v3` to retrieve the repository's code.
  - **Set Up Docker Buildx**: Configures Docker Buildx with `docker/setup-buildx-action@v2`.
  - **Cache Docker Layers**: Caches Docker layers to speed up builds using `actions/cache@v2`.
  - **Test Build**: Builds the Docker image without pushing it, using `docker/build-push-action@v3`.
  - **Run Tests**: Executes test commands (customizable).
  - **Move Cache**: Updates the Docker cache to include the new build.

#### 2. **Build & Push Production Manipur**

- **Purpose**: Builds and pushes Docker images for the Manipur production environment.
- **Condition**: Runs only on pushes to the `production` branch.
- **Steps**:
  - **Checkout Code**: Retrieves the repository code.
  - **Update Environment**: Sets up environment variables and copies configuration files.
  - **Docker Meta**: Generates Docker image metadata and tags using `docker/metadata-action@v4`.
  - **Set Up Docker Buildx**: Configures Docker Buildx.
  - **Cache Docker Layers**: Caches Docker layers.
  - **Login to GitHub Container Registry**: Authenticates with GitHub Container Registry using `docker/login-action@v2`.
  - **Build Image**: Builds and pushes the Docker image with `docker/build-push-action@v3`.
  - **Move Cache**: Updates the Docker cache.

#### 3. **Build & Push Production Assam**

- **Purpose**: Builds and pushes Docker images for the Assam production environment.
- **Condition**: Runs only on pushes to the `production` branch.
- **Steps**:
  - **Checkout Code**: Retrieves the repository code.
  - **Update Environment**: Sets up environment variables and copies configuration files.
  - **Docker Meta**: Generates Docker image metadata and tags.
  - **Set Up Docker Buildx**: Configures Docker Buildx.
  - **Cache Docker Layers**: Caches Docker layers.
  - **Login to GitHub Container Registry**: Authenticates with GitHub Container Registry.
  - **Build Image**: Builds and pushes the Docker image.
  - **Move Cache**: Updates the Docker cache.

#### 4. **Build & Push Production Karnataka**

- **Purpose**: Builds and pushes Docker images for the Karnataka production environment.
- **Condition**: Runs only on pushes to the `production` branch.
- **Steps**:
  - **Checkout Code**: Retrieves the repository code.
  - **Update Environment**: Sets up environment variables and copies configuration files.
  - **Docker Meta**: Generates Docker image metadata and tags.
  - **Set Up Docker Buildx**: Configures Docker Buildx.
  - **Cache Docker Layers**: Caches Docker layers.
  - **Login to GitHub Container Registry**: Authenticates with GitHub Container Registry.
  - **Build Image**: Builds and pushes the Docker image.
  - **Move Cache**: Updates the Docker cache.

#### 5. **Build & Push Production Nagaland**

- **Purpose**: Builds and pushes Docker images for the Nagaland production environment.
- **Condition**: Runs only on pushes to the `production` branch.
- **Steps**:
  - **Checkout Code**: Retrieves the repository code.
  - **Update Environment**: Sets up environment variables and copies configuration files.
  - **Docker Meta**: Generates Docker image metadata and tags.
  - **Set Up Docker Buildx**: Configures Docker Buildx.
  - **Cache Docker Layers**: Caches Docker layers.
  - **Login to GitHub Container Registry**: Authenticates with GitHub Container Registry.
  - **Build Image**: Builds and pushes the Docker image.
  - **Move Cache**: Updates the Docker cache.

#### 6. **Deploy to GKE Manipur**

- **Purpose**: Deploys the Docker image to the GKE cluster for Manipur.
- **Dependencies**: Requires successful completion of the `build-production-manipur` job.
- **Steps**:
  - **Checkout Kube Config**: Retrieves Kubernetes configuration files from the `coronasafe/mn-care-infra` repository.
  - **Setup gcloud CLI**: Configures Google Cloud CLI.
  - **Get GKE Credentials**: Retrieves credentials for accessing the GKE cluster.
  - **Install kubectl**: Installs the `kubectl` CLI tool.
  - **Deploy Care Dashboard**: Applies the Kubernetes deployment configuration using `kubectl`.

#### 7. **Deploy to GKE Karnataka**

- **Purpose**: Deploys the Docker image to the GKE cluster for Karnataka.
- **Dependencies**: Requires successful completion of the `build-production-karnataka` job.
- **Steps**:
  - **Checkout Kube Config**: Retrieves Kubernetes configuration files from the `coronasafe/ka-care-infra` repository.
  - **Setup gcloud CLI**: Configures Google Cloud CLI.
  - **Get GKE Credentials**: Retrieves credentials for accessing the GKE cluster.
  - **Install kubectl**: Installs the `kubectl` CLI tool.
  - **Deploy Care Dashboard**: Applies the Kubernetes deployment configuration.

#### 8. **Deploy to GKE Nagaland**

- **Purpose**: Deploys the Docker image to the GKE cluster for Nagaland.
- **Dependencies**: Requires successful completion of the `build-production-nagaland` job.
- **Steps**:
  - **Checkout Kube Config**: Retrieves Kubernetes configuration files from the `coronasafe/nl-care-infra` repository.
  - **Setup gcloud CLI**: Configures Google Cloud CLI.
  - **Get GKE Credentials**: Retrieves credentials for accessing the GKE cluster.
  - **Install kubectl**: Installs the `kubectl` CLI tool.
  - **Deploy Care Dashboard**: Applies the Kubernetes deployment configuration.

### Key Points

- **Docker Metadata**: Metadata actions are used to tag Docker images based on various patterns and run numbers.
- **Caching**: Docker layer caching is used to speed up builds by reusing previous build layers.
- **Deployment**: Each deployment job includes steps to set up Kubernetes and apply configuration files to the GKE clusters.

This workflow ensures that Docker images are built, pushed, and deployed to specific environments based on the branch and events, with caching and metadata handling to optimize the process.
