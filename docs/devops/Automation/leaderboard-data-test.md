### `scraper.yaml`

The `scraper.yaml` workflow is designed to automate the process of scraping data and handling related tasks. The workflow performs the following key actions:

1. **Trigger**:
   - **Scheduled Run**: Executes daily at 1:00 AM UTC.
   - **Manual Trigger**: Can be manually triggered via the GitHub Actions interface (`workflow_dispatch`).

2. **Main Job**: `run-scraper`
   - **Conditions**: Runs only if the workflow is triggered from the `main` branch.
   - **Permissions**:
     - **Issues**: Read access.
     - **Pull Requests**: Read access.
     - **Contents**: Write access.
   - **Secrets**: Inherits secrets from the repository.
   - **Parameters**:
     - **Slack EOD Channel**: Uses the Slack channel variable specified in the repository.
