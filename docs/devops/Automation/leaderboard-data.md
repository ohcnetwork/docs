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

---

### `post-eod-activities-slack.yaml`

The `post-eod-activities-slack.yaml` workflow is designed to post end-of-day (EOD) messages to a specified Slack channel. The workflow includes the following key components:

1. **Trigger**:
   - **Scheduled Run**: Executes daily at 1:30 PM UTC.
   - **Manual Trigger**: Can be manually triggered via the GitHub Actions interface (`workflow_dispatch`).

2. **Main Job**: `run-slack-eod-reminder`
   - **Conditions**: Runs only if the workflow is triggered from the `main` branch.
   - **Permissions**:
     - **Issues**: Read access.
     - **Pull Requests**: Read access.
   - **Parameters**:
     - **Leaderboard URL**: Uses a specified URL for the leaderboard.
   - **Secrets**:
     - **GitHub Personal Access Token**: For authenticating GitHub API requests.
     - **Leaderboard API Key**: For accessing the leaderboard.
     - **Slack EOD Bot Channel**: Specifies the Slack channel for posting.
     - **Slack EOD Bot Token**: Authenticates the bot for Slack interactions.
