| **Workflow File**              | **Description** |
|--------------------------------|-----------------|
| `auto-testing-label.yml`       |  Automatically adds testing labels to pull requests or issues. |
| `codeql-analysis.yml`          |  Performs CodeQL analysis to identify potential security vulnerabilities. |
| `combine.yml`                  |  Combines multiple workflows or tasks into a single workflow run. |
| `comment-p1-issues.yml`        |  Adds comments to issues labeled as P1 (Priority 1). |
| `cypress.yaml`                 |  Runs end-to-end tests using Cypress. |
| `deploy.yaml`                  |  Handles the deployment of the front-end application. |
| `issue-automation.yml`         |  Automates issue management, such as labeling and assigning issues. |
| `label-deploy-failed.yml`      |  Labels pull requests or issues when a deployment fails. |
| `label-merge-conflict.yml`     |  Adds a label to pull requests with merge conflicts. |
| `label-wip.yml`                |  Labels pull requests as WIP (Work in Progress). |
| `linter.yml`                   |  Runs linters to ensure front-end code quality. |
| `ossar-analysis.yml`           |  Runs OSSAR (Open Source Security and Analysis) to identify vulnerabilities. |
| `release.yml`                  |  Manages the release process for the front-end application. |
| `stale.yml`                    |  Marks stale issues or pull requests that have had no activity for a specified period. |
| `thank-you.yml`                |  Sends a thank-you message or comment to contributors. |


## Table of Contents

1. [Pull Request and Issue Management](#pull-request-and-issue-management)
2. [Code Quality and Security](#code-quality-and-security)
3. [Testing](#testing)
4. [Deployment and Release Management](#deployment-and-release-management)
5. [Dependency Management](#dependency-management)
6. [Maintenance](#maintenance)

## Pull Request and Issue Management

### Auto Testing Label (auto-testing-label.yml)

This workflow manages the "needs testing" label on pull requests.

**Triggers:**
- Pull request events (opened, reopened, edited)
- Issue comments
- Pull request reviews

**Key Features:**
- Checks if a PR is in draft mode
- Adds "needs testing" label when a PR is ready for testing or transitions from draft
- Removes the label and adds a reminder comment if changes are requested

**Purpose:** Helps maintain clear status of PRs in the testing pipeline.

### Comment on P1 Issues (comment-p1-issues.yml)

Adds comments to issues labeled as P1 (Priority 1).

**Triggers:**
- When a P1 label is added to an issue

**Key Features:**
- Checks if the issue is assigned
- If unassigned, adds a general warning about P1 issues
- If assigned, tags the assignees and asks for acknowledgment

**Purpose:** Helps manage high-priority issues more effectively.

### Issue Automation (issue-automation.yml)

Automates issue management in the project board.

**Triggers:**
- Issue events (opened, reopened, closed, assigned)

**Key Features:**
- Moves new or reopened issues to "Triage"
- Moves closed issues to "Done"
- Moves assigned issues to "In Progress"

**Purpose:** Maintains an organized and up-to-date project board.

### Label Deploy Failed (label-deploy-failed.yml)

Manages labels for failed preview deployments.

**Triggers:**
- Issue comments on pull requests

**Key Features:**
- Adds "Deploy-Failed" label when a deploy preview fails
- Removes the label when the preview is successfully ready

**Purpose:** Quickly identifies and tracks deployment issues in PRs.

### Label Merge Conflicts (label-merge-conflict.yml)

Labels pull requests with merge conflicts.

**Triggers:**
- Pushes to develop branch
- Pull requests to develop branch

**Key Features:**
- Adds a "merge conflict" label when conflicts are detected
- Adds a comment asking the author to rebase

**Purpose:** Maintains a clean PR process by highlighting conflicts early.

### Label Work in Progress (label-wip.yml)

Labels issues linked to open pull requests as "work-in-progress".

**Triggers:**
- Pull request events (opened, reopened, edited, closed)

**Key Features:**
- Adds "work-in-progress" label to linked issues when PR is open
- Removes the label when the PR is closed

**Purpose:** Provides visibility into which issues are actively being worked on.

### Thank You Note (thank-you.yml)

Adds a thank you comment to contributors when their pull requests are merged.

**Triggers:**
- When a PR is closed and merged

**Key Features:**
- Adds a comment thanking the contributor(s)
- Tags both the PR author and any assignees

**Purpose:** Recognizes and appreciates contributors' efforts.

## Code Quality and Security

### CodeQL Analysis (codeql-analysis.yml)

Implements CodeQL analysis for JavaScript code.

**Triggers:**
- Pushes to develop and master branches
- Pull requests to develop branch
- Weekly schedule (Sundays at 22:00 UTC)

**Key Features:**
- Runs CodeQL initialization and analysis
- Focuses on JavaScript language

**Purpose:** Ensures ongoing code quality and security checks, helping identify potential vulnerabilities.

### Linter (linter.yml)

Runs linting checks on the codebase.

**Triggers:**
- Pull requests to develop and master branches

**Key Features:**
- Sets up Node.js environment
- Runs npm lint command

**Purpose:** Maintains code quality and consistency.

### OSSAR Analysis (ossar-analysis.yml)

Runs the Open Source Static Analysis Runner (OSSAR).

**Triggers:**
- All pushes and pull requests

**Key Features:**
- Runs on Windows latest
- Performs static analysis
- Uploads results to GitHub's Security tab

**Purpose:** Adds an additional layer of security analysis to the codebase.

## Testing

### Cypress Tests (cypress.yaml)

Runs Cypress tests for the application.

**Triggers:**
- Daily schedule
- Pull requests to develop or staging branches
- Manual triggers

**Key Features:**
- Sets up both frontend and backend environments
- Runs tests in parallel across multiple containers
- Handles both forked and non-forked PR scenarios
- Uploads test artifacts (screenshots and videos) on failure

**Purpose:** Ensures comprehensive UI testing before merging changes.

## Deployment and Release Management

### Deploy Care Fe (deploy.yaml)

Handles the building and deployment process.

**Triggers:**
- Pushes to develop and staging branches
- New version tags
- Pull requests to develop and staging
- Manual triggers

**Key Features:**
- Builds and tests Docker images
- Pushes images to container registries
- Deploys to staging environments
- Notifies about production-ready releases

**Purpose:** Automates the entire deployment pipeline from development to production.

### Create Release (release.yml)

Creates new releases when code is pushed to the production branch.

**Triggers:**
- Pushes to production branch

**Key Features:**
- Calculates the next version tag based on the current date and existing tags
- Creates and pushes a new tag
- Generates a draft release with auto-generated release notes

**Purpose:** Automates the release process, ensuring consistent versioning.

## Dependency Management

### Combine Dependencies (combine.yml)

Combines dependency-related pull requests.

**Triggers:**
- Manual trigger (workflow_dispatch)

**Key Features:**
- Uses the github/combine-prs action
- Combines PRs labeled as "dependencies" into a single PR
- Adds a "combined-dependencies" label to the resulting PR

**Purpose:** Manages multiple dependency updates more efficiently.

## Maintenance

### Close Stale Issues and PRs (stale.yml)

Manages stale issues and pull requests.

**Triggers:**
- Runs daily

**Key Features:**
- Labels issues and PRs as stale after a period of inactivity
- Exempts certain labels from being marked as stale
- Can close stale items after additional inactivity

**Purpose:** Keeps the repository clean and focused on active work.

---
