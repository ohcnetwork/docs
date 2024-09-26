
### `custom_nginx.yml`

The `custom_nginx.yml` workflow is designed to build and deploy a Docker image for a custom NGINX configuration, specifically for the `teleicu_nginx` setup. The workflow performs the following steps:

1. **Trigger**: The workflow runs on any push to the `master` branch.

2. **Environment Setup**:
   - **Environment Name**: Production.
   - **Image Name**: The Docker image is identified by the name `teleicu_nginx`.

3. **Main Job**: `build`
   - **Runs-on**: `ubuntu-latest`
   - **Steps**:
     - **Checkout Code**: Clones the repository.
     - **Build Docker Image**:
       - Builds the Docker image using a `Dockerfile`.
       - Includes a build argument `HTPASSWD` retrieved from secrets.
     - **Log into Registry**: Logs into GitHub's Docker registry using a GitHub token.
     - **Push Image**:
       - Tags the Docker image with an appropriate version.
       - Pushes the Docker image to the registry, using `latest` if the branch is `master`, otherwise using the specific tag name.

---

### `issue-automation.yml`

The `issue-automation.yml` workflow is designed to automate the handling of GitHub issues related to the `teleicu_nginx` project. The workflow includes the following key components:

1. **Trigger**: The workflow activates on issues that are opened, reopened, or closed.

2. **Main Jobs**:
   - **Job 1: `issue_opened_and_reopened`**:
     - **Runs-on**: `ubuntu-latest`
     - **Condition**: Runs if an issue is opened or reopened.
     - **Steps**:
       - **Move Issue to Triage**:
         - Uses a GitHub Action to move the issue to the "Triage" status in the specified project board.
   - **Job 2: `issue_closed`**:
     - **Runs-on**: `ubuntu-latest`
     - **Condition**: Runs if an issue is closed.
     - **Steps**:
       - **Move Issue to Done**:
         - Moves the closed issue to the "Done" status in the specified project board.
