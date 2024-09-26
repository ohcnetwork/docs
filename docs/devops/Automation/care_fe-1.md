
## `auto-testing-label.yml`

This workflow manages the "needs testing" label on pull requests.

1. **Triggers**:
   - Pull request events (opened, reopened, edited)
   - Issue comments
   - Pull request reviews

### Jobs:

- **Label Management**:
  - Checks if a pull request is in draft mode.
  - Adds the "needs testing" label when the pull request is ready for testing or transitions from draft.
  - Removes the label and adds a reminder comment if changes are requested.

---

## `comment-p1-issues.yml`

This workflow manages comments on issues labeled as P1 (Priority 1).

1. **Triggers**:
   - When a P1 label is added to an issue

### Jobs:

- **Issue Management**:
  - Checks if the issue is assigned.
  - If unassigned, adds a general warning about P1 issues.
  - If assigned, tags the assignees and asks for acknowledgment.

---

## `issue-automation.yml`

This workflow automates issue management in the project board.

1. **Triggers**:
   - Issue events (opened, reopened, closed, assigned)

### Jobs:

- **Manage Issues**:
  - Moves new or reopened issues to the "Triage" column in the project board.
  - Moves closed issues to the "Done" column.
  - Moves assigned issues to the "In Progress" column.

---

## `label-deploy-failed.yml`

This workflow manages labels for failed preview deployments.

1. **Triggers**:
   - Issue comments on pull requests

### Jobs:

- **Deploy Management**:
  - Adds the "Deploy-Failed" label when a deploy preview fails.
  - Removes the label when the preview is successfully ready.

---

## `label-merge-conflict.yml`

This workflow labels pull requests with merge conflicts.

1. **Triggers**:
   - Pushes to the develop branch
   - Pull requests to the develop branch

### Jobs:

- **Conflict Detection**:
  - Adds a "merge conflict" label when conflicts are detected.
  - Adds a comment asking the author to rebase.

---

## `label-wip.yml`

This workflow labels issues linked to open pull requests as "work-in-progress".

1. **Triggers**:
   - Pull request events (opened, reopened, edited, closed)

### Jobs:

- **Label Management**:
  - Adds the "work-in-progress" label to linked issues when the pull request is open.
  - Removes the label when the pull request is closed.

---

## `thank-you.yml`

This workflow adds a thank you comment to contributors when their pull requests are merged.

1. **Triggers**:
   - When a pull request is closed and merged

### Jobs:

- **Acknowledgment**:
  - Adds a comment thanking the contributor(s).
  - Tags both the pull request author and any assignees.

---

## `codeql-analysis.yml`

This workflow implements CodeQL analysis for JavaScript code.

1. **Triggers**:
   - Pushes to the develop and master branches
   - Pull requests to the develop branch
   - Weekly schedule (Sundays at 22:00 UTC)

### Jobs:

- **Code Analysis**:
  - Runs CodeQL initialization and analysis.
  - Focuses on JavaScript language to ensure ongoing code quality and security checks.

---

## `linter.yml`

This workflow runs linting checks on the codebase.

1. **Triggers**:
   - Pull requests to the develop and master branches

### Jobs:

- **Linting**:
  - Sets up the Node.js environment.
  - Runs the npm lint command to maintain code quality and consistency.

---

## `ossar-analysis.yml`

This workflow runs the Open Source Static Analysis Runner (OSSAR).

1. **Triggers**:
   - All pushes and pull requests

### Jobs:

- **Static Analysis**:
  - Runs on Windows latest.
  - Performs static analysis.
  - Uploads results to GitHub's Security tab for an additional layer of security analysis.

---

## `cypress.yml`

This workflow runs Cypress tests for the application.

1. **Triggers**:
   - Daily schedule
   - Pull requests to the develop or staging branches
   - Manual triggers

### Jobs:

- **Cypress Testing**:
  - Sets up both frontend and backend environments.
  - Runs tests in parallel across multiple containers.
  - Handles both forked and non-forked pull request scenarios.
  - Uploads test artifacts (screenshots and videos) on failure.

---

## `deploy.yml`

This workflow handles the building and deployment process.

1. **Triggers**:
   - Pushes to develop and staging branches
   - New version tags
   - Pull requests to develop and staging
   - Manual triggers

### Jobs:

- **Build**:
  - Builds and tests Docker images.
  - Pushes images to container registries.
- **Deploy to Staging**:
  - Deploys the application to staging environments.
- **Notify**:
  - Notifies about production-ready releases.

---

## `release.yml`

This workflow creates new releases when code is pushed to the production branch.

1. **Triggers**:
   - Pushes to the production branch

### Jobs:

- **Release Management**:
  - Calculates the next version tag based on the current date and existing tags.
  - Creates and pushes a new tag.
  - Generates a draft release with auto-generated release notes.

---

## `combine.yml`

This workflow combines dependency-related pull requests.

1. **Triggers**:
   - Manual trigger (workflow_dispatch)

### Jobs:

- **Combine PRs**:
  - Uses the `github/combine-prs` action.
  - Combines pull requests labeled as "dependencies" into a single pull request.
  - Adds a "combined-dependencies" label to the resulting pull request.

---

## `stale.yml`

This workflow manages stale issues and pull requests.

1. **Triggers**:
   - Runs daily

### Jobs:

- **Stale Management**:
  - Labels issues and pull requests as stale after a period of inactivity.
  - Exempts certain labels from being marked as stale.
  - Closes stale items after additional inactivity.

---
