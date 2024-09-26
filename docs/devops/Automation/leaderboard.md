### `remind-and-post-eod-updates-to-slack.yaml`

The `remind-and-post-eod-updates-to-slack.yaml` workflow automates the process of sending reminders to contributors and posting their end-of-day (EOD) updates to a designated Slack channel. This workflow is composed of the following steps:

1. **Workflow Trigger and Inputs**:
   - **Inputs**: Accepts the Leaderboard API URL.
   - **Secrets**: Includes GitHub PAT, Leaderboard API key, Slack channel, and bot token.

2. **Main Job**: `Remind, wait, and Post EOD updates of contributors to slack channel`.
   - **Checkout Code**:
     - Clones the calling repository.
     - Clones the `coronasafe/leaderboard` repository with a sparse checkout focused on the `activities-bot` directory.
   - **Setup Node.js**: Installs Node.js version 21.x.
   - **Install Dependencies**: Installs necessary npm packages.
   - **Send Reminders**: Runs a script to send reminder messages to contributors.
   - **Wait**: Introduces a 30-minute delay before posting updates.
   - **Post EOD Updates**: Executes a script to post the collected EOD updates to the specified Slack channel.

---

### `scraper-dry-run.yaml`

The `scraper-dry-run.yaml` workflow is designed for testing the data scraping functionality, including validation of the output schema. It includes the following key components:

1. **Workflow Triggers**:
   - **Triggers**: Can be manually triggered or triggered by pull requests that modify specific paths.

2. **Main Job**: `Test run GitHub Scraper`.
   - **Checkout Code**: Clones the repository.
   - **Setup Environment**:
     - Installs Node.js (version 20.14.0).
     - Installs pnpm globally.
   - **Install Dependencies**: Uses pnpm to install project dependencies with a frozen lockfile.
   - **Build Project**: Compiles the project to ensure all components are correctly built.
   - **Scrape Data**: Runs the scraper to gather data from GitHub repositories.
   - **Generate Contributor Files**: Produces markdown files for newly identified contributors.
   - **Upload Artifacts**: Uploads generated data and contributor files for further analysis.
   - **Setup pnpm Cache**: Configures caching for pnpm to optimize future runs.
   - **Run Tests**: Executes tests to validate the correctness of the scraper.

---

### `scraper.yaml`

The `scraper.yaml` workflow is responsible for scraping data from both GitHub and Slack, committing the results, and updating the repository. It includes the following steps:

1. **Workflow Trigger and Inputs**:
   - **Inputs**: Accepts an optional Slack channel, a specific branch of the `scraper` to use, and various secrets.

2. **Main Job**: `Scrape data from GitHub and Slack`.
   - **Checkout Code**:
     - Clones the calling repository.
     - Clones the `coronasafe/leaderboard` repository with a sparse checkout focused on the `scraper` and `scripts` directories.
   - **Setup Node.js**: Installs Node.js version 20.14.0 and pnpm.
   - **Install Dependencies**: Uses pnpm to install project dependencies with a frozen lockfile.
   - **Build Project**: Compiles the project.
   - **Scrape GitHub Data**: Runs the scraper to collect data from GitHub.
   - **Setup Python**: Installs Python (version 3.10) and necessary dependencies.
   - **Scrape Slack Data** (Conditional): Scrapes end-of-day updates from Slack if the API token and channel are provided.
   - **Generate Contributor Files**: Creates markdown files for new contributors.
   - **Commit and Push Changes**: Commits the generated data and contributor files to the repository and pushes the changes.
