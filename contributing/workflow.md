---
sidebar_position: 4
title: Contribution workflow
---

# Contribution workflow

This page walks through the end-to-end path a change takes — from finding an issue to getting your pull request merged. It applies to both the backend ([ohcnetwork/care](https://github.com/ohcnetwork/care)) and the frontend ([ohcnetwork/care_fe](https://github.com/ohcnetwork/care_fe)). If you haven't set up your environment yet, start with the [Contributor's Guide overview](./intro.md) and the [backend local setup](./local-development/backend.md).

## 1. Find and claim work

Both repositories tag approachable, well-scoped issues so you can find a starting point quickly:

- **Backend** — browse the [`good first issue`](https://github.com/ohcnetwork/care/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22good+first+issue%22) and [`help wanted`](https://github.com/ohcnetwork/care/issues?q=is%3Aissue+sort%3Aupdated-desc+label%3A%22help+wanted%22+is%3Aopen) issues on `ohcnetwork/care`.
- **Frontend** — browse the equivalent `good first issue` and `help wanted` labels on `ohcnetwork/care_fe`.

When you find an issue you'd like to take:

- Comment on the issue saying you'd like to work on it, and wait to be assigned. This avoids two people building the same thing.
- Link your pull request to the issue once you open it, so the issue closes automatically when the PR merges. See GitHub's guide on [linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).

:::tip
If an issue has been assigned but looks inactive, comment to ask whether it's still being worked on rather than opening a duplicate PR.
:::

## 2. Branch off `develop`

`develop` is the default branch for contributions and the base for every pull request. Always branch from the latest `develop`, never from `main`.

```bash
git checkout develop
git pull
git checkout -b issues/7001/edit-prescriptions
```

The frontend convention for branch names is `issues/{issue#}/{short-name}` (for example, `issues/7001/edit-prescriptions`). Using a descriptive branch name keeps your work easy to trace back to its issue.

## 3. Follow the coding standards

Each repository ships its own linting and formatting tooling. Run it locally before you push so review focuses on substance, not style.

### Backend

The backend follows PEP 8 and enforces it with [Ruff](https://docs.astral.sh/ruff/) via `pre-commit`. Install the hooks once after setting up your environment:

```bash
pre-commit install
```

Run the hooks against the files you changed on your branch:

```bash
pre-commit run --files $(git diff --name-only develop...HEAD)
```

With the hooks installed, `pre-commit` also runs automatically on every `git commit`.

### Frontend

The frontend uses ESLint and Prettier. Lint and format your changes before committing:

```bash
npm run lint
npm run format
```

The dev server (`npm run dev`) also surfaces lint errors in the console as you work.

### Commit messages

Write clear, descriptive commit messages that explain *what* changed and *why*. Use a meaningful pull request title too — the frontend repo favours a short, descriptive title such as `💊 Adds support for editing prescriptions`.

## 4. Test before you push

Run the relevant test suite locally and make sure it passes before pushing.

- **Backend** — see the test commands in the [backend local setup](./local-development/backend.md).
- **Frontend** — end-to-end tests run on [Playwright](https://playwright.dev/). Install the browsers once with `npm run playwright:install`, then run `npm run playwright:test`. Playwright requires a local backend with seeded data; see the [backend local setup](./local-development/backend.md) for how to run and seed it.

:::note
Frontend Playwright tests need the frontend pointed at your local backend. Set `REACT_CARE_API_URL=http://127.0.0.1:9000` in your environment before running them.
:::

## 5. Open a pull request

Push your branch and open a pull request against `develop`.

- **Open a draft early.** Opening a draft PR as soon as you have something to show makes it easy to get early feedback and signals that the issue is being worked on. Mark it **Ready for review** when it's complete.
- **Fill in the PR body.** Follow the PR template and reference the issue with a closing keyword (for example, `Closes #7001`) so it links and closes automatically.
- **Request review.** For frontend PRs, tag `@ohcnetwork/care-fe-code-reviewers` for faster resolution.
- **Attach screenshots.** For any change that touches the UI, attach before/after screenshots (or a short screen capture) showing the change.
- **Address feedback promptly.** Respond to review comments and push follow-up commits. On the frontend, a reviewed PR is labelled **Needs Testing** and queued for QA; once QA passes it is labelled **Tested** and queued for merge.

:::tip
Keep pull requests focused. A small PR that does one thing is reviewed and merged far faster than a large one that mixes unrelated changes.
:::

## 6. Keep your branch in sync with `develop`

While your PR is open, `develop` keeps moving. If GitHub reports conflicts, sync your branch with the upstream `develop` and resolve them locally.

If you haven't already, add the canonical repository as an `upstream` remote. Use the `ohcnetwork` org in the URL (the frontend repo is shown here; for the backend, use `https://github.com/ohcnetwork/care.git`):

```bash
git remote add upstream https://github.com/ohcnetwork/care_fe.git
```

Fetch the latest upstream history and merge `develop` into your branch:

```bash
git fetch upstream
git merge upstream/develop
```

If the merge reports conflicts, open the affected files and resolve the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), keeping the correct combination of both sides. Then stage the resolved files and complete the merge:

```bash
git add .
git commit
```

Push the updated branch to refresh your pull request:

```bash
git push
```

:::warning
Always merge `upstream/develop` into your feature branch — never the reverse. Resolve conflicts carefully: deleting the wrong side of a conflict marker can silently drop someone else's work.
:::

## Code of Conduct

All participation in the Care community is governed by the [Contributor Covenant Code of Conduct](https://github.com/ohcnetwork/care/blob/develop/CODE_OF_CONDUCT.md). By contributing, you agree to uphold it — be respectful, assume good faith, and help keep the community welcoming.
