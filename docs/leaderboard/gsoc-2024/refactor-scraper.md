# Refactor Scraper

## Title
### **Refactor Scraper From Python To Typescript**

---
## Description

Refactoring scraper from Python to the TypeScript we have some advantages like 
  1. Type safety
  2. Octokit integration will give more effective interaction with GitHub API
  3. Using GraphQL we can also fetch only require things wherever needed.
---
## Installation and Setup

### Prerequisites
- Octokit library (^4.0.2) - [Octokit on npm](https://www.npmjs.com/package/octokit)
---
## Usage Guide

### Basic Usage
Run the following command inside the `scraper` directory:
```sh
pnpm dev org_name data_dir [date] [num_days]
```
**Example :** 
1. pnpm dev coronasafe data-repo/github 
2. pnpm dev coronasafe data-repo/github 2024-07-21 30
---
## Implementation Details

### Code Structure
- Pull Request Link : [Link](https://github.com/coronasafe/leaderboard/pull/458)
- The scraper code is divided into nine different files, which are stored inside `scraper/src/github-scraper`.

### Files
1. [index.ts](#1-indexts)
2. [fetchEvents.ts](#2-fetcheventsts)
3. [parseEvents.ts](#3-parseeventsts)
4. [fetchUserData.ts](#4-fetchuserdatats)
5. [discussion.ts](#5-discussionts)
6. [saveData.ts](#6-savedatats)
7. [utils.ts](#7-utilsts)
8. [config.ts](#8-typests)
9. [types.ts](#9-configts)

### Modules and Functions

### 1. index.ts

**Description:**
- This is the entry point for the scraper. When the command is run, this file is called first.
- It handles all the scraping processes, and all the data is stored here and passed through here to save the data.
- This file contains two functions: `main()` and `scrapeGitHub()`.
- A global variable `processedData` is declared inside this file. It is responsible for storing all the event data of the user.

**Functions and Their Responsibilities:**

1. **main()**
   - This function is the entry point for scraping all GitHub data.
   - It does not accept any arguments and returns void.
   - It extracts command line arguments:
     1. Organization name
     2. Data directory
     3. Date
     4. Number of days
   - After extracting the above, it calculates the start and end dates and passes the information to the following functions step by step:
     1. `scrapeGitHub(orgName, endDate, startDate)`
     2. `mergedData(dataDir, processedData)`
     3. `scrapeDiscussions(orgName, dataDir, endDate, startDate)`

2. **scrapeGitHub()**
   - This function manages the fetching of all GitHub-related events and parses them into the desired structure. It also fetches merged pull requests and open pull requests for the user.
   - It accepts three arguments: organization name, start date, and end date.
   - The return type is void.
   - It fetches all GitHub events and parses them by calling the following functions step by step:
     1. `fetchEvents(org, startDate, endDate)`
     2. `parseEvents(events)`
     3. `fetchMergeEvents(user, org)`
     4. `fetchOpenPulls(user, org)`

### 2. fetchEvents.ts

**Description:**

This file fetches all GitHub events using the Octokit library and returns an array of fetched events after excluding blacklisted users and including only the required event types. It contains one function:

1. `fetchEvents(org, startDate, endDate)`

Additionally, it contains two arrays used to filter the fetched events:
1. **Blacklisted Users:** Editable from the `.env` file of the scraper.
2. **Required Event Types:**
   - `IssueCommentEvent`
   - `IssuesEvent`
   - `PullRequestEvent`
   - `PullRequestReviewEvent`

**Functions and Their Responsibilities:**

1. **fetchEvents()**
   - **Purpose:** Fetches all GitHub events using the Octokit library and the pagination method.
   - **Implementation:**
     - Fetches events, which are then filtered by the start and end dates and the aforementioned filters.
     - Accepts three arguments: organization name, start date, and end date.
     - Returns an array of filtered events.
   - **Query Snippet for fetching events:**
     ```typescript
     const events = await octokit.paginate("GET /orgs/{org}/events", {
       org: org,
       per_page: 1000,
     });
     ```


### 3. parseEvents.ts
 - This file's job is to parse the events which pases from the `index.ts` by calling the function `parseEvents()`.
 - This file is the responsible to give the meaning to the fteched data and abstract neccessary information from them and store the data user wise
 - It traverse on the all recieved events then parse the event according to their type.
 - This file contains 3 functions
     1. parseEvents()
     2. appendEvent()
     3. addCollaborations() 

**Functions and Their Work:**
 
1. **parseEvents()**
   - This function is traverse on all the events and for each event it do some operations and filters
   - First of all it will remove Black Listed users.
   - Then using switch case handle 4 different types of the events given below:
      1. Issue Comment Event,
      2. Issues Event,
      3. Pull RequestEvent,
      4. Pull Request ReviewEvent
   - Here's the what will do on each event type
     1. `Issue Comment Event` :
        - If the user created comment on issue then it will parse the data from the event as given below example
        ```typescript
          type: "comment_created",
          title: org/repository and the issue number,
          time: When the comment is created,
          link: Link of the comment,
          text: body of comment,
        ``` 
     2. `Issues Event` :
        - This case contian 3 possiblites the issue event types can be 3 `opened`, `assigned`, and `closed`.
        ```typescript
            type: It can be any from above 3 type,
            title: org/repository and the issue number,
            time: When the issue is opened or assigned or closed,
            link: Link of the issue,
            text: Title of the issue,
        ``` 
     3. `Pull Request Event` :
        - This case contain two possibilities the PR is open or pr is merged
          - For open pr the event object will look like this :
          ```typescript
              type: "pr_opened",
              title: org/repository and the PR number,
              time: Time when PR is opend,
              link: PR link,
              text: Pr title,
          ```

          - For the close pr and it is merged then event object will look like this
          ```typescript
              type: "pr_merged",
              title: org/repository and the PR number,
              time: Time when PR is Merged,
              link: PR link,
              text: Pr title,
              turnaround_time: turnaroundTime,
          ```
          - For merged pr there is new field added `turnaround_time` which is calculate by the function [calculateTurnaroundTime()]
          - Also in this case one more function is call [addCollabration()] which add this event in to the coAuthors of the pull request and for this case object will change as below :
          ```typescript
              type: "pr_collaborated",
              title: org/repository and the PR number,
              time: Time when PR is Merged,
              link: PR link,
              text: Pr title,
              collaborated_with: Collborators array in that event,
          ```
  
      4. `Pull Request Review Event` :
           - This case it parse event type based on if pr review request is created or mentainer reviewed contrbutor's PR 
           ```typescript
               type: "pr_reviewed",
               title: org/repository and the PR number,
               time: Time when PR is opend,
               link: PR Review link,
               text: PR title,
           ```

2. **addCollaborations()** 
   - This will take two Parameters : PullRequestEvent and Event time
   - It's return type is void
   - This function will fetch all coloborators who worked on that PR this details fetched by all traversing all the commits and also this function exclude blacklisted user's commit
   - Afte collecting the colloborators it will append event with user with event type "pr_collaborated".

3. **appendEvent()**
   - The appendEvent function is designed to log an event for a specified user within the processedData object. It either creates a new user entry if the user does not already exist in processedData or updates an existing entry with the new event. The function also ensures that the last_updated timestamp for the user is appropriately updated based on the event time.
   - Take Two parameters : `User` and `Parsed Event`


### 4. fetchUserData.ts

**Description**

This file is responsible for fetching user-related data from GitHub. Specifically, it retrieves currently open pull requests and merged pull request details for a user. It contains two functions that take the user and organization name as arguments:
1. `fetchMergeEvents()`
2. `fetchOpenPulls()`

**Functions and Their Responsibilities:**

1. **fetchMergeEvents()**
    - **Purpose:** Fetches details of closed pull requests made by a user in the organization across all repositories.
    - **Implementation:**
      - Utilizes Octokit and the request method to fetch data. Here is a snippet of the query:
        ```typescript
        const { data: issues } = await octokit.request("GET /search/issues", {
          q: `is:issue is:closed org:${org} author:${user}`,
        });
        ```
      - Returns an array of merged pull requests.
      - **Workflow:**
        - First, it fetches all issues assigned to the user that were closed by merging a PR using the query above.
        - It then traverses all issues and fetches their `timeline_events` using Octokit and the request method. Here is the query snippet:
          ```typescript
          const { data: timeline_events } = await octokit.request(
            "GET " + issue.timeline_url,
          );
          ```
        - After fetching all timeline events of the issue, it traverses the timeline events and checks the following conditions by calling the function `resolveAutonomyResponsibility()`:
          1. Is the event type **cross-referenced**?
          2. Is the source type **issue**?
          3. Is the user the same as the event user?
        - If all three conditions are met, it stores the details of the issue and its pull request for the user in an array named `merged_prs`.
        - The `merged_prs` array stores objects containing `issue_link` and `pr_link`.
        - The function returns the array of `merged_prs` to be stored with the main object of the user details.

2. **fetchOpenPulls()**
    - **Purpose:** Fetches all currently open pull requests of the user in the organization across all repositories and calculates the number of days since a pull request was last updated.
    - **Implementation:**
      - Fetches all open pull requests by the user using Octokit and its request method. Here is the query snippet:
        ```typescript
        const { data } = await octokit.request("GET /search/issues", {
          q: `is:pr is:open org:${org} author:${user}`,
        });
        ```
      - Returns an array of open pull requests.
      - **Object Structure:**
        ```typescript
        {
          link: Link of the Pull Request,
          title: Title,
          stale_for: Number of days since the PR was last updated,
          labels: Labels assigned to the Pull Request,
        }
        ```

### 5. discussion.ts

**Description:**
- This file handles the fetching, parsing, and storing of discussions.
- It contains three functions:
  1. `scrapeDiscussions()`
  2. `fetchGitHubDiscussions()`
  3. `parseDiscussionData()`

**Functions and Their Responsibilities:**

1. **scrapeDiscussions()**
   - This function is the entry point for scraping GitHub discussions.
   - It is called by the `main()` function in the `index.ts` file.
   - It accepts four parameters: `Organization Name`, `Data Directory`, `End Date`, and `Start Date`.
   - This function sequentially calls the following functions:
     1. `fetchGitHubDiscussions()`
     2. `parseDiscussionData()`
     3. `saveDiscussionData()`

2. **fetchGitHubDiscussions()**
   - This function uses the `octokit/graphql` query to fetch discussions from GitHub based on the specified parameters.
   - It accepts three parameters: `Organization Name`, `End Date`, and `Start Date`.
   - The query used is as follows:
     ```typescript
     query($org: String!, $cursor: String) {
       organization(login: $org) {
         repositories(first: 100, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }) {
           pageInfo {
             hasNextPage
             endCursor
           }
           edges {
             node {
               name
               discussions(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
                 edges {
                   node {
                     title
                     body
                     author {
                       login
                     }
                     url
                     isAnswered
                     category {
                       name
                       emojiHTML
                     }
                     comments(first: 10) {
                       edges {
                         node {
                           author {
                             login
                           }
                         }
                       }
                     }
                     createdAt
                     updatedAt
                   }
                 }
               }
             }
           }
         }
       }
     }
     ```
   - It uses the `octokit/paginate/iterator` method to fetch data. After each iteration, it checks if the data is within the specified date range. If not, the iteration stops, and the fetched discussions are returned.
   - Discussions are fetched based on the repository's last updated time and the discussion's last updated time.

3. **parseDiscussionData()**
   - This function processes a list of discussions, filtering them based on the specified date range. It returns an array of parsed discussions containing relevant information such as title, author, participants, and more.
   - It accepts three parameters: `Organization Name`, `End Date`, and `Start Date`.
   - It returns an array of parsed discussion objects. Each object contains the following details:
     ```typescript
      {
        source: "github",
        title: Title of the Discussion,
        text: Body text of the discussion,
        author: Author's GitHub username,
        link: Discussion link,
        isAnswered: Indicates whether the discussion is answered,
        time: Creation time of the discussion,
        updateTime: Last update time of the discussion,
        category: {
          name: Category name,
          emoji: Category icon,
        },
        participants: Array of participants,
        repository: Repository name,
      }
     ```

### 6. saveData.ts

**Description:**
- This file is responsible for merging new data with existing data for each user.
- Contains a single function: `mergedData()`.

**Functions and Their Responsibilities:**

1. **`mergedData()`**
   - **Purpose:** Updates user data by merging new activity events from `processedData` with existing activity data. It ensures that each user only has unique activity events by checking if an event is already present in the old data. New unique events are added to the beginning of the existing activity data.
   - **Parameters:** 
     - `dataDir` (`string`): Directory where user data is stored.
     - `processedData` (`ProcessData`): New user data to be merged.
   - **Return Type:** `void`.


### 7. utils.ts

- **Description:** Contains utility functions used by other files.

**Functions and Their Responsibilities:**

1. **`isBlacklisted()`**
   - **Purpose:** Checks if a user is blacklisted.
2. **`calculateTurnaroundTime()`**
   - **Purpose:** Calculates the turnaround time for a pull request.
3. **`resolveAutonomyResponsibility()`**
   - **Purpose:** Checks conditions for `cross-referenced` issues and determines if the source type is an issue.
4. **`loadUserData()`**
   - **Purpose:** Loads user data from the data directory.
5. **`saveUserData()`**
   - **Purpose:** Saves merged data to the data directory.
6. **`mergeDiscussions()`**
   - **Purpose:** Merges discussions with existing discussions.
7. **`saveDiscussionData()`**
   - **Purpose:** Saves discussions to the data directory.


### 8. types.ts

- **Description:** Contains all the types required for building the scraper.

### 9. config.ts

- **Description:** Checks if the `GITHUB_TOKEN` is present and enables the use of Octokit by authorizing based on GitHub Personal Access Token (PAT).

--- 
### Results and Achievements

- **Milestones:** 
  1. Completed the refactoring of the GitHub scraper.

---

### References

- [GitHub GraphQL API](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)
- [Octokit](https://github.com/octokit)
