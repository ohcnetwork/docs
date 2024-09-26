## `scraper.yml`

The `scraper.yml` workflow is designed to automate the scraping of data on a daily schedule or on-demand.

### Triggers

1. **Scheduled Runs**:
   - The workflow is triggered by a cron schedule set to run every day at 06:30 IST (`0 1 * * *` UTC).
   - The scraper fetches data for the last 24 hours by default, so it runs exactly once a day to ensure that all relevant data is captured.

2. **Manual Dispatch**:
   - The workflow can also be triggered manually using the `workflow_dispatch` event, allowing for flexibility to run the scraper outside the scheduled time.

### Job: `run-scraper`

1. **Reusable Workflow**:
   - The workflow utilizes a reusable workflow from the `coronasafe/leaderboard` repository, specifically the `scraper.yaml` file from the `main` branch.
   - This approach allows you to maintain consistency and reduce redundancy by leveraging a predefined scraping process.

2. **Conditional Execution**:
   - The job is set to run only if the workflow is triggered on the `main` branch (`github.ref == 'refs/heads/main'`). This ensures that the scraper runs only on the production branch.

3. **Permissions**:
   - The job is granted read permissions for issues and pull requests, and write permissions for contents. This allows the scraper to interact with repository content as needed, such as writing scraped data back to the repository.

4. **Secrets Management**:
   - The job uses a secret named `GIT_ACCESS_TOKEN` for authentication. This token is securely stored in GitHub secrets and is used to authorize operations within the workflow.

5. **Parameters**:
   - The workflow accepts a parameter, `slack-eod-channel`, which is passed from a GitHub variable `SLACK_EOD_CHANNEL`. This could be used for notifications or logging the end-of-day (EOD) results to a Slack channel.

This workflow automates the process of scraping data on a daily basis and provides an option to run it manually, ensuring that the latest information is consistently captured and processed.
