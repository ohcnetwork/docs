## `workflow.yml`

The `workflow.yml` workflow consists of the following tasks:

1. **Trigger Events**:
   - The workflow is triggered by push or pull request events to the `master` branch.

2. **Checkout Code**:
   - Uses `actions/checkout@v2` to check out the repository code, making it available for subsequent steps.

3. **Login to Heroku Container Registry**:
   - Logs into the Heroku Container Registry using the `heroku container:login` command. The Heroku API key is provided via the `HEROKU_API_KEY` secret.

4. **Build and Push Container**:
   - Builds and pushes the Docker container to Heroku with the `heroku container:push` command, targeting the `web` process type for the `ohcnetwork-bot` app.

5. **Release Container**:
   - Releases the Docker container to the Heroku app using the `heroku container:release` command, making the updated container live.
---
