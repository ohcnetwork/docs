| **Workflow File**         | **Description** |
|---------------------------|-----------------|
| `codeql-analysis.yml`      |  Executes CodeQL analysis to identify potential security

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
