
| **Workflow File**        | **Description** |
|--------------------------|-----------------|
| `anchore-analysis.yml`    |  Performs Anchore analysis to scan container images for vulnerabilities. |
| `codeql-analysis.yml`     |  Runs CodeQL analysis to identify security vulnerabilities in the codebase. |
| `ossar-analysis.yml`      |  Executes OSSAR analysis to check for security vulnerabilities. |
| `production.yml`          |  Manages the deployment to the production environment. |

## `anchore-analysis.yml`

The `anchore-analysis.yml` workflow performs the following tasks:

1. **Checkout Code**: Retrieves the latest code from the repository.
2. **Build Docker Image**: Builds the Docker image using the provided Dockerfile.
3. **Run Anchore Scan**: Executes Anchore analysis to scan the Docker image for vulnerabilities and integrates the results with GitHub Advanced Security code scanning.
4. **Upload Scan Report**: Uploads the Anchore scan report in SARIF format for further analysis.

---

## `codeql-analysis.yml`

The `codeql-analysis.yml` workflow runs CodeQL analysis to identify security vulnerabilities in the codebase. The workflow includes:

1. **Checkout Repository**: Fetches the code from the repository with a fetch depth of 2.
2. **Initialize CodeQL**: Prepares the CodeQL tools for scanning.
3. **Autobuild**: Attempts to automatically build the project, with manual build steps as a fallback.
4. **Perform CodeQL Analysis**: Conducts the CodeQL analysis to identify vulnerabilities in the codebase.

---

## `ossar-analysis.yml`

The `ossar-analysis.yml` workflow executes OSSAR (Open Source Static Analysis Runner) analysis to check for security vulnerabilities. The key steps include:

1. **Checkout Repository**: Retrieves the code from the repository for analysis.
2. **Install .NET**: Installs the required .NET version to support OSSAR.
3. **Run OSSAR**: Executes the OSSAR analysis using the GitHub action.
4. **Upload Results**: Uploads the OSSAR scan results to the GitHub Security tab for review.

---

## `production.yml`

The `production.yml` workflow manages deployment to the production environment. It consists of three main jobs:

### Test Job

1. **Checkout Code**: Retrieves the code from the repository.
2. **Run Tests**:
   - Builds and runs tests using Docker Compose if the `docker-compose.test.yml` file is available.
   - Falls back to building the Docker image using a Dockerfile if Docker Compose is not available.

### Build and Push Job

1. **Build Docker Image**: Constructs the Docker image with the production tag.
2. **Log In to Docker Registry**: Authenticates with the Docker registry using a GitHub token.
3. **Push Docker Image**: Pushes the Docker image to the registry with appropriate tags based on the Git reference.

### Deploy Job

1. **Deploy to GKE Manipur**: Deploys the Docker image to the GKE Manipur environment.
2. **Manage Containers**:
   - Stops and removes the existing Docker container.
   - Pulls and runs the new image with necessary environment variables.
3. **Restart Nginx**: Ensures Nginx is restarted to apply changes on the server.
