## `makefile.yml`

The `makefile.yml` workflow consists of the following steps:

1. **Check Out Code**:
   - Checks out the code from the repository.

2. **Build Packages**:
   - Builds language-specific packages using the `make` command.

3. **Configure Git**:
   - Configures Git with a bot user's credentials.

4. **Commit Changes**:
   - Commits any modifications with the message `"Add submission report"` if there are changes.

5. **Push Changes**:
   - Pushes the committed changes back to the `main` branch.
   - Uses the `ad-m/github-push-action` with a GitHub token for authentication.

---
