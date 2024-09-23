# Backend Architecture

## Backend Architecture

### Core Modules and Functionalities

* **Models**: Define the data structures and relationships within the application, representing entities such as:
  * **User**: Stores user account information, including usernames, email addresses, passwords, roles, and permissions.
  * **Project**: Represents individual projects with details like title, description, associated documents, prompt, AI model configuration, and preset questions.
  * **Chat**: Stores information about chat sessions, including the associated project, user, timestamps, and conversation history.
  * **ChatMessage**: Represents individual messages within a chat, with details like the message type (user, Ayushma, or system), content, language, and associated metadata.
  * **Document**: Stores information about reference documents, including titles, descriptions, file paths or URLs, and document types.
  * **Test Suite**: Represents a collection of test cases with questions, expected answers, and language settings used for evaluating the AI assistant's performance.
  * **Test Run**: Stores information about test suite executions, including the associated project, timestamps, status, and results of individual test cases.
  * **Feedback**: Captures feedback provided by admins or reviewers on individual test cases within a test run.
* **Serializers**: Responsible for converting data between Python objects (model instances) and JSON format for API interactions. They define how data is represented in API requests and responses.
* **Views**: Handle incoming HTTP requests from the frontend, interact with models and serializers, perform business logic, and return appropriate responses. Examples include:
  * **User Views**: Manage user registration, login, authentication, and account updates.
  * **Project Views**: Handle project creation, modification, deletion, and retrieval of project details.
  * **Chat Views**: Manage chat creation, conversation history retrieval, message sending, and chat deletion.
  * **Document Views**: Handle document uploading, processing, metadata management, and linking documents to projects.
  * **Test Suite Views**: Manage test suite creation, modification, execution, and deletion.
  * **Test Run Views**: Handle retrieval and analysis of test run results, including individual test case outcomes and aggregate metrics.
* **API Router**: Maps URL patterns to specific views, ensuring that API requests are routed to the appropriate endpoints for processing.
* **Background Tasks (Celery)**: Manages asynchronous tasks, such as:
  * **Document Processing**: Handles tasks like file uploading, text extraction from documents and URLs, and embedding generation.
  * **Test Suite Execution**: Runs test suites against selected projects, evaluates results, and generates reports.
  * **Stale Data Cleanup**: Periodically removes outdated or incomplete data, such as unfinished test runs or failed document uploads.

### Backend Technologies and Libraries

* **Django**: The foundational web framework for the backend, providing structure, data management tools, and security features.
* **Django REST Framework**: A powerful toolkit for building RESTful APIs, simplifying data serialization, request handling, and authentication.
* **PostgreSQL**: A robust and scalable relational database for storing and managing application data.
* **Celery**: An asynchronous task queue for handling background tasks, ensuring efficient processing of time-consuming operations without blocking the main application flow.
* **Pinecone**: A vector database for storing and managing document embeddings, enabling fast and efficient similarity search during conversations.
* **OpenAI**: Integration with OpenAI's API for accessing large language models, speech-to-text, and text-to-speech services.
* **Additional Libraries**: Ayushma's backend may utilize various other libraries for tasks like data processing, language translation, and communication with external services.

### Design Considerations and Trade-offs

* **Scalability and Performance**: The backend architecture is designed to be scalable, accommodating increasing amounts of data and user traffic. Techniques such as database optimization, caching, and asynchronous task processing ensure optimal performance and responsiveness.
* **Security and Data Integrity**: Security is a top priority, with measures in place to protect user data, prevent unauthorized access, and maintain data integrity.
* **Modularity and Maintainability**: The backend codebase follows modular design principles, promoting code organization, reusability, and maintainability.
* **Flexibility and Extensibility**: The architecture allows for flexibility and extensibility, enabling the integration of new AI models, data sources, and functionalities as needed.
* **Error Handling and Logging**: Robust error handling and logging mechanisms are implemented to ensure system stability, facilitate debugging, and provide insights into potential issues.

### **Component Structure**

The backend consists of several key components:

* **Models**: Define the data structures and relationships within the application, representing entities such as users, projects, chats, and documents.
* **Serializers**: Responsible for converting data between Python objects and JSON format for API interactions.
* **Views**: Handle incoming HTTP requests, interact with models and serializers, and return responses.
* **API Router**: Manages the routing of API requests to appropriate views and ensures proper URL structure.
* **Background Tasks**: Celery handles asynchronous tasks, such as document processing, test suite execution, and other time-consuming operations.

### Communication and Data Flow

The frontend and backend communicate via a RESTful API. The frontend sends requests to the backend API to retrieve or update data, and the backend responds with JSON-formatted data. Jotai manages the state and data flow on the frontend, while Django REST Framework handles API requests and responses on the backend. Celery manages asynchronous tasks, and Pinecone facilitates efficient information retrieval during conversations.

### Project Folder Structure

#### Root Directory

* **manage.py**: A command-line utility for interacting with the Django project. It provides various commands for tasks like starting the development server, running database migrations, and creating admin users.
* **README.md**: A documentation file containing information about the project, including installation instructions, dependencies, and contribution guidelines.
* **requirements**: This directory typically contains files that specify the project's dependencies, such as requirements.txt for listing Python libraries needed for the project to run.
* **.env**: (Often included in a .gitignore file to avoid committing sensitive information) Stores environment variables, such as API keys and database credentials.
* **core**: The main application directory containing settings, configuration, and other essential files.
  * **settings**: Stores configuration files for different environments, such as development, testing, and production.
  * **urls.py**: Defines URL patterns and their mappings to specific views, acting as the entry point for handling incoming HTTP requests.
  * **wsgi.py**: An entry point for deploying the Django application with a WSGI-compliant web server.
  * **asgi.py**: An entry point for deploying the Django application with an ASGI-compliant web server.
* **ayushma**: The primary application directory containing the core logic, models, views, and other components of Ayushma.
  * **migrations**: Stores database migration files that track changes to the database schema over time.
  * **admin.py**: Registers models with the Django admin interface, allowing admins to manage data through a web-based interface.
  * **apps.py**: Contains the application configuration class.
  * **models**: Defines the data models representing various entities within the application, such as users, projects, chats, messages, and documents.
  * **serializers**: Houses serializers responsible for converting data between Python objects and JSON format for API interactions.
  * **views**: Contains views that handle incoming HTTP requests, interact with models and serializers, and return responses.
  * **api\_router.py**: Defines the URL structure for the RESTful API and maps URL patterns to corresponding views.
  * **permissions.py**: Contains custom permission classes that control access to specific views or actions based on user roles and authentication status.
  * **utils**: This directory may include various utility modules and helper functions for tasks like language processing, document management, and integration with external services.
* **utils**: Contains utility modules and helper functions that are shared across different parts of the application.

#### Additional Files and Directories

* **templates**: Stores HTML template files for rendering dynamic content, such as email notifications or error pages.
* **static**: Contains static files such as CSS, JavaScript, and images that are served directly to the client-side.
* **media**: Stores user-uploaded files, such as audio recordings or document files.
