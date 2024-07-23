# Refactor Scraper

## Title
**Refactor Python Scraper To Typescript**

## Installation and Setup

### Prerequisites
- Octokit library (^4.0.2) - [Octokit on npm](https://www.npmjs.com/package/octokit)

### Installation Instructions
To enable the GitHub Discussion feature in the Leaderboard:
1. Add `Discussions` to `NEXT_PUBLIC_FEATURES` in the `.env` file.

## Usage Guide

### Basic Usage
Run the following command inside the scraper directory:
```sh
pnpm dev org_name data_dir [date] [num_days]
```
**Example :** 
1. pnpm dev coronasafe data-repo/github 
2. pnpm dev coronasafe data-repo/github 2024-07-21 30

## Implementation Details

### Code Structure
The codebase is organized into the following directories:

- **`scraper/src/github-scraper`**: Contains all files related to the GitHub scraper.
- **`app/discussions`**: Contains the main page for Discussions.
- **`components/discussions`**: Contains all required components to display discussions.
- **`lib/discussions.ts`**: Contains all necessary functions to fetch and filter discussions.

### Modules and Functions

#### 1. Scraper

**`index.ts`**: Main module for running the scraper
- **`main()`**: Initiates the scraping process.
- **`scrapeGitHub()`**: Scrapes GitHub data.
- **`scrapeDiscussions()`**: Scrapes GitHub Discussions and stores them in the discussions directory.

**`fetchEvents.ts`**: Fetches GitHub events
- **`fetchEvents()`**: Fetches all GitHub events using the Octokit library.

**`parseEvents.ts`**: Parses GitHub events
- **`parseEvents()`**: Parses GitHub events for the event types `IssueCommentEvent`, `IssuesEvent`, `PullRequestEvent`, and `PullRequestReviewEvent`.
- **`appendEvent()`**: Collects scraper data for users during scraping.
- **`addCollaborations()`**: Fetches collaborators for closed `PullRequestEvent`.

**`fetchUserData.ts`**: Fetches user data
- **`fetchMergeEvents()`**: Fetches details of merged pull requests for contributors.
- **`fetchOpenPulls()`**: Fetches currently open pull requests for contributors.

**`saveData.ts`**: Saves data
- **`mergedData()`**: Merges data with the existing contributor data.

**`discussion.ts`**: Manages discussion scraping
- **`scrapeDiscussions()`**: Fetches, parses, and saves GitHub Discussions.
- **`fetchGitHubDiscussions()`**: Fetches all GitHub discussions using Octokit GraphQL.
- **`parseDiscussionData()`**: Parses GitHub discussions.

#### 2. Discussions UI

**`lib/discussion.ts`**: Manages fetching and filtering discussions
- **`fetchGithubDiscussion()`**: Fetches GitHub Discussions from the data repository and can filter by the number of days or user, or return all discussions.
- **`getGithubDiscussions()`**: Returns discussions in the form of `Activity` for the user profile.
- **`checkAnsweredByUser()`**: Checks if the user has answered a particular discussion.
- **`fetchParticipants()`**: Fetches participants using Octokit GraphQL.

#### 3. Layout Page and UI Components

- **`app/discussion`**: Contains layout and discussion page.
- **`components/discussions`**:
  1. `GithubDiscussions.tsx`
  2. `GithubDiscussion.tsx`
  3. `FilterDiscussions.tsx`
  4. `DiscussionLeaderboard.tsx`

#### 4. Modify point mechanism and enable Empath badge
   - Answered GitHub Discussion: 5 Points.
   - Created GitHub Discussion: 2 Points.
   - Commented on Discussion: 1 Point (applies once per discussion).
   - Enable an **empathy badge** based on GitHub Discussions that are answered.

## Testing
- **Test Cases**: Test the github scraping data .
- **Running Tests**: `pnpm test`
- **Test Coverage**: It covers github-data schema and discussion-data



## Results and Achievements
- **Milestones**: 
1. Completed the refactoring of the GitHub scraper.
2. Integrated GitHub Discussions using GraphQL.

## Discussions UI

### Desktop View
https://github.com/user-attachments/assets/eb713544-19d5-41b4-9411-a6f9f49d3e5f

### Mobile View
https://github.com/user-attachments/assets/bc48833b-f216-4ec3-9d5c-2248e3577004

## References and Acknowledgments
#### **References**: 
  - [GitHub GraphQL API](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)
  - [Octokit](https://github.com/octokit)
- **Acknowledgments**: Thanks to my mentors for their guidance and support.