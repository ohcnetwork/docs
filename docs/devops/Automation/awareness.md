## `test.yml`

The `test.yml` workflow performs the following tasks:

1. **Checkout Code**:
   - Uses the `actions/checkout@v2` action to check out the repository code.

2. **Setup Node.js**:
   - Uses the `actions/setup-node@v1` action to set up Node.js.

3. **Install Dependencies**:
   - Runs `npm ci` to install project dependencies.

4. **Build Project**:
   - Runs `npm run re:build` and `npm run build` to build the project.

5. **Run Tests**:
   - Executes `npm test` to run the project tests with the `CI` environment variable set to `true`.

6. **Trigger Events**:
   - The workflow is triggered on push events and pull requests.


---
