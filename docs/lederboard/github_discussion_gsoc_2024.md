# Integrate GitHub Discussion in Leaderboard

## Update Observations

### Task 1: Refactor Python Scraper into TypeScript

#### Problems with the Current Scraper:

1. The current scraper uses the GitHub REST API, which is not the most efficient.
2. It lacks type safety.
3. Python does not support GitHub GraphQL for fetching GitHub discussions.
4. The codebase is monolithic, reducing readability.

#### Solution Implementation:

1. Analyzed the current scraper to identify requirements.
2. Defined TypeScript types for the scraper.
3. Implemented type-safe fetching using Octokit and GraphQL.
4. Modularized the scraper into nine different files for improved readability.
5. Conducted individual and integration testing for each functionality.
6. Updated `tsconfig.json` for TypeScript configuration.

### Task 2: Workflow Update and Testing

#### Update GitHub Workflow (`scraper-dry-run.yaml`):

- Configured Node.js environment setup.
- Installed dependencies using PNPM.
- Built the TypeScript scraper with `pnpm build`.
- Generated Markdown files for new contributors.
- Added dependencies for running tests.

#### Implementation Testing:

- Created GitHub activity data schema.
- Ran tests for user activity data based on the GitHub schema.

### Task 3: Integrate GitHub Discussion with TypeScript Scraper

#### Scraping GitHub Discussion:

1. Utilized GraphQL API to scrape GitHub discussions.
2. Declared necessary types in `types.ts`.

#### Parsing and Storing GitHub Discussion:

1. Analyzed UI requirements and Point Calculation logic.
2. Parsed required data from fetched GitHub discussions.
3. Stored GitHub discussion data in `data/github/discussion/discussion.json`.

#### Testing GitHub Discussion Data:

1. Created a discussion schema for testing purposes.
2. Implemented testing logic for GitHub discussion data.

### Task 4: Create Discussion UI to Display GitHub Discussions

1. Designed GitHub discussion route.
2. Implemented discussion card UI for displaying GitHub discussions.
3. Added filter feature based on GitHub activity and date range.
4. Displayed GitHub discussions on the homepage with a "show more" button.
5. Integrated GitHub discussions with contributor activity data.

### Task 5: Implement Point Mechanism for GitHub Discussion

1. Implemented a point mechanism based on GitHub discussion interactions:
   - Answered GitHub Discussion: 7 Points.
   - Created GitHub Discussion: 2 Points.
   - Commented on Discussion: 1 Point (applies once per discussion).

2. Based on Disucssion Points Display Top 10 Contributor's for at discussion route
   - In Progress

