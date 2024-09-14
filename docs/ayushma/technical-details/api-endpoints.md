# API Endpoints

Ayushma's backend exposes a RESTful API, providing programmatic access to various functionalities for both users and administrators. The API endpoints are defined and managed within the `ayushma/api_router.py` file.

Here is the restructured documentation formatted in Markdown. I've categorized and formatted the endpoints to improve readability and navigation, using code blocks and bullet points where appropriate:

***

## User Management Endpoints

### Registration

* **Endpoint**: `POST /api/auth/register`
* **Request Body**: Requires `username`, `full name`, `email`, `password`, and `recaptcha token`.
* **Response**: Returns a `201 Created` status code upon successful registration.

### Login

* **Endpoint**: `POST /api/auth/login`
* **Request Body**: Requires `email` and `password`.
* **Response**: Returns a JSON object with the auth token upon successful login.

### User Info

* **Endpoint**: `GET /api/users/me`
* **Response**: Returns a JSON object containing the user's details such as `username`, `full name`, `email`, and `roles`.

### Update User Info

* **Endpoint**: `PATCH /api/users/me`
* **Request Body**: Accepts fields like `full_name` and `password` for updating.
* **Response**: Returns a `200 OK` status code with the updated user information.

### List Users (Admin only)

* **Endpoint**: `GET /api/users`
* **Optional Query Parameters**: Supports filtering and search based on criteria like `username`, `full name`, and `roles`.
* **Response**: Returns a paginated list of user objects in JSON format.

### User Details (Admin only)

* **Endpoint**: `GET /api/users/{username}`
* **Response**: Returns a JSON object with the user's information.

### Update User (Admin only)

* **Endpoint**: `PATCH /api/users/{username}`
* **Request Body**: Accepts fields like `full_name`, `email`, and `roles` for updating.
* **Response**: Returns a `200 OK` status code with the updated user information.

### Delete User (Admin only)

* **Endpoint**: `DELETE /api/users/{username}`
* **Response**: Returns a `204 No Content` status code upon successful deletion.

***

## Project Management Endpoints

### List Projects

* **Endpoint**: `GET /api/projects`
* **Optional Query Parameters**: Supports filtering and search based on `project title` and `archived status`.
* **Response**: Returns a paginated list of project objects in JSON format.

### Create Project (Admin only)

* **Endpoint**: `POST /api/projects`
* **Request Body**: Requires `title`, `description`, `prompt` (optional), and `AI model configuration`.
* **Response**: Returns a `201 Created` status code with the newly created project details.

### Project Details

* **Endpoint**: `GET /api/projects/{project_id}`
* **Response**: Returns a JSON object with the project's information, including `title`, `description`, `documents`, `prompt`, and `AI model configuration`.

### Update Project (Admin only)

* **Endpoint**: `PATCH /api/projects/{project_id}`
* **Request Body**: Accepts fields like `title`, `description`, `prompt`, `AI model configuration`, and `preset questions` for updating.
* **Response**: Returns a `200 OK` status code with the updated project information.

### Delete Project (Admin only)

* **Endpoint**: `DELETE /api/projects/{project_id}`
* **Response**: Returns a `204 No Content` status code upon successful deletion.

### List Documents in Project

* **Endpoint**: `GET /api/projects/{project_id}/documents`
* **Response**: Returns a paginated list of document objects in JSON format.

### Add Document to Project (Admin only)

* **Endpoint**: `POST /api/projects/{project_id}/documents`
* **Request Body**: Requires `document file` or `text content`, `title`, and optional `description`.
* **Response**: Returns a `201 Created` status code with the newly added document details.

### Document Details

* **Endpoint**: `GET /api/projects/{project_id}/documents/{document_id}`
* **Response**: Returns a JSON object with the document's information.

### Update Document (Admin only)

* **Endpoint**: `PATCH /api/projects/{project_id}/documents/{document_id}`
* **Request Body**: Accepts fields like `title` and `description` for updating.
* **Response**: Returns a `200 OK` status code with the updated document information.

### Delete Document (Admin only)

* **Endpoint**: `DELETE /api/projects/{project_id}/documents/{document_id}`
* **Response**: Returns a `204 No Content` status code upon successful deletion.

***

## Chat and Conversation Endpoints

### Retrieve Chat Sessions

* **Endpoint**: `GET /api/projects/{project_id}/chats`
* **Response**: Returns a paginated list of chat objects in JSON format.

### Create Chat Session

* **Endpoint**: `POST /api/projects/{project_id}/chats`
* **Request Body**: Optionally accepts an initial message to start the conversation.
* **Response**: Returns a `201 Created` status code with the details of the newly created chat.

### Retrieve Chat History

* **Endpoint**: `GET /api/projects/{project_id}/chats/{chat_id}`
* **Response**: Returns a JSON object containing the chat details and a list of messages.

### Update Chat Session

* **Endpoint**: `PATCH /api/projects/{project_id}/chats/{chat_id}`
* **Request Body**: Accepts fields like `title` for updating.
* **Response**: Returns a `200 OK` status code with the updated chat information.

### Converse in Chat

* **Endpoint**: `POST /api/projects/{project_id}/chats/{chat_id}/converse`
* **Request Body**: Accepts either text or audio input, along with optional parameters like language and temperature settings.
* **Response**: Returns a JSON object containing the AI's response and relevant metadata.

### Convert Speech to Text

* **Endpoint**: `POST /api/projects/{project_id}/chats/{chat_id}/speech_to_text`
* **Request Body**: Requires an audio file and optional language settings.
* **Response**: Returns a JSON object with the transcribed text and processing metadata.

### Delete Chat Session

* **Endpoint**: `DELETE /api/projects/{project_id}/chats/{chat_id}`
* **Response**: Returns a `204 No Content` status code upon successful deletion.



***

## Test Suite and Test Run Endpoints

### Retrieve Test Suites

* **Endpoint**: `GET /api/tests/suites`
* **Response**: Returns a paginated list of test suite objects in JSON format.

### Create Test Suite

* **Endpoint**: `POST /api/tests/suites`
* **Request Body**: Requires suite name, temperature setting, top k parameter, and a list of test questions (with question text, expected answer, and language).
* **Response**: Returns a `201 Created` status code with the newly created test suite details.

### Retrieve Test Suite Details

* **Endpoint**: `GET /api/tests/suites/{suite_id}`
* **Response**: Returns a JSON object with the test suite's information, including name, parameters, and test questions.

### Update Test Suite

* **Endpoint**: `PATCH /api/tests/suites/{suite_id}`
* **Request Body**: Accepts fields like name, temperature, top k, and test questions for updating.
* **Response**: Returns a `200 OK` status code with the updated test suite information.

### Delete Test Suite

* **Endpoint**: `DELETE /api/tests/suites/{suite_id}`
* **Response**: Returns a `204 No Content` status code upon successful deletion.

### Retrieve Test Questions

* **Endpoint**: `GET /api/tests/suites/{suite_id}/questions`
* **Response**: Returns a paginated list of test question objects in JSON format.

### Add Test Question

* **Endpoint**: `POST /api/tests/suites/{suite_id}/questions`
* **Request Body**: Requires question text, expected answer, and language.
* **Response**: Returns a `201 Created` status code with the newly added test question details.

### Retrieve Test Question Details

* **Endpoint**: `GET /api/tests/suites/{suite_id}/questions/{question_id}`
* **Response**: Returns a JSON object with the test question's information.

### Update Test Question

* **Endpoint**: `PATCH /api/tests/suites/{suite_id}/questions/{question_id}`
* **Request Body**: Accepts fields like question text, expected answer, and language for updating.
* **Response**: Returns a `200 OK` status code with the updated test question information.

### Delete Test Question

* **Endpoint**: `DELETE /api/tests/suites/{suite_id}/questions/{question_id}`
* **Response**: Returns a `204 No Content` status code upon successful deletion.

### Retrieve Test Runs

* **Endpoint**: `GET /api/tests/suites/{suite_id}/runs`
* **Response**: Returns a paginated list of test run objects in JSON format.

### Initiate Test Run

* **Endpoint**: `POST /api/tests/suites/{suite_id}/runs`
* **Request Body**: Requires project ID and optional settings like enabling or disabling reference document usage.
* **Response**: Returns a `201 Created` status code with the details of the newly initiated test run.

### Retrieve Test Run Results

* **Endpoint**: `GET /api/tests/suites/{suite_id}/runs/{run_id}`
* **Response**: Returns a JSON object containing the test run details, including individual test case outcomes and aggregate metrics.

***

## Orphan Chat Endpoints

### Retrieve Orphan Chats

* **Endpoint**: `GET /api/chats`
* **Response**: Returns a paginated list of chat objects in JSON format.

### Create Orphan Chat

* **Endpoint**: `POST /api/chats`
* **Request Body**: Optionally accepts an initial message and model selection to start the conversation.
* **Response**: Returns a `201 Created` status code with the details of the newly created chat.

### Retrieve Orphan Chat History

* **Endpoint**: `GET /api/chats/{chat_id}`
* **Response**: Returns a JSON object containing the chat details and a list of messages.

### Converse in Orphan Chat

* **Endpoint**: `POST /api/chats/{chat_id}/converse`
* **Request Body**: Accepts either text or audio input, along with optional parameters like language and temperature settings.
* **Response**: Returns a JSON object containing the AI's response and relevant metadata.

***

### API Authentication and Authorization

* **HTTP Clients**: Libraries or tools like requests (Python) or axios (JavaScript) to send HTTP requests and receive responses.
* **API Clients**: Language-specific libraries that provide a more convenient and structured way to interact with the API, often handling tasks like authentication, serialization, and error handling.
* **Integration Platforms**: Services or platforms that facilitate integration with Ayushma's API, allowing for data exchange and workflow automation.

Developers can interact with Ayushma's API using tools like:

### API Usage and Integration

* **Token Authentication**: Most API endpoints require token-based authentication, where the client includes a valid auth token in the Authorization header of the request.
* **API Key Authentication**: Orphan chat endpoints and temporary token generation use API key-based authentication. The client provides the API key in the X-API-KEY header.
* **Permission Levels**: Different API endpoints have varying permission levels based on user roles. Admin users typically have access to all endpoints, while regular users might have restricted access.

\
