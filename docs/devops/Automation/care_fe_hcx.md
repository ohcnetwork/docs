
| **Workflow File**              | **Description** |
|--------------------------------|-----------------|
| `codeql-analysis.yml`          | Performs CodeQL analysis to identify potential security vulnerabilities, with an added check for the repository name. |
| `comment-p1-issues.yml`        | Adds comments to issues labeled as P1 (Priority 1), including a check for the repository name. |
| `cypress.yaml`                 | Runs end-to-end tests using Cypress, with a check for the repository name. |
| `deploy-hcx.yaml`              | Handles the deployment configuration for the HCX project. |
| `deploy.yaml`                  | Manages the deployment process, including a check for the repository name. |
| `issue-automation.yml`         | Automates issue management, such as labeling and assigning issues, with a check for the repository name. |
| `label-deploy-failed.yml`      | Labels pull requests or issues when a deployment fails, including a check for the repository name. |
| `label-merge-conflict.yml`     | Adds a label to pull requests with merge conflicts, with a check for the repository name. |
| `label-wip.yml`                | Labels pull requests as WIP (Work in Progress), including a check for the repository name. |
| `ossar-analysis.yml`           | Runs OSSAR (Open Source Security and Analysis) to identify vulnerabilities, with a check for the repository name. |
| `stale.yml`                    | Marks stale issues or pull requests that have had no activity for a specified period. |
