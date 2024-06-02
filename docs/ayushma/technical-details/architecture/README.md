# Architecture

Ayushma's architecture follows a modular design, separating the frontend and backend components while ensuring seamless communication and integration between them.

<figure><img src="../../assets/image (14).png" alt="" /><figcaption></figcaption></figure>

## Module Descriptions:

* **Frontend:**
  * **User Interface (A):** This encompasses all the visual elements and interactive components that users see and interact with, including the chat interface, project management pages, and admin dashboards. It is built using Next.js, Tailwind CSS, and other UI libraries.
  * **State Management (B):** Jotai manages the application state, ensuring data consistency and reactivity across various components. It handles updates to the UI based on user interactions and API responses.
  * **API Requests (C):** This module is responsible for making HTTP requests to the backend API to fetch or update data. It utilizes libraries like Tanstack React Query to optimize data retrieval and caching.
* **Backend:**
  * **Backend API (D):** The backend API, built using Django and Django REST Framework, receives requests from the frontend, processes them, and sends back responses.
  * **Business Logic (E):** This module contains the core logic of the application, including handling user authentication, project and document management, chat conversations, test suite execution, and interactions with AI models and the vector database.
  * **Database (F):** PostgreSQL stores the structured data of the application, such as user information, project details, chat history, and document metadata.
  * **AI Models (G):** This module represents the integration with external AI models, such as those provided by OpenAI, for tasks like text generation, translation, speech-to-text, and text-to-speech.
  * **Vector Database (H):** Pinecone, a vector database, stores and manages document embeddings, enabling efficient similarity search and retrieval of relevant information during conversations.
* **Asynchronous Tasks:**
  * **Celery (I):** Celery manages background tasks that may require significant processing time or need to run asynchronously.
  * **Document Processing (J):** This module handles tasks related to document uploading, text extraction, and embedding generation.
  * **Test Suite Execution (K):** Celery manages the execution of test suites, including running test cases, evaluating results, and generating reports.
