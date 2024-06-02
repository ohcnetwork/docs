# Reference Document Management

Reference document management is a crucial aspect of project administration in Ayushma. It involves adding, organizing, and maintaining the collection of documents that serve as the knowledge base for the AI assistant within each project.

<figure><img src="../assets/image (4).png" alt="" /><figcaption></figcaption></figure>

## Adding Reference Documents

1. **Access Project Documents**: Navigate to the documents section within the selected project.
2. **Initiate Document Addition**: Click the "Add Document" button or a similar option.
3. **Select Document Type**: Choose the appropriate document type based on the source and format of the information:
   * **File**: Upload documents directly from your local system. Ayushma may support various file formats, such as PDF, TXT, DOCX, and others.
   * **URL**: Provide a URL to a web page or online resource containing relevant information. Ayushma will extract and process the text content from the linked page.
   * **Text**: Directly input text content into the provided text area.
4. **Enter Document Details**:
   * **Title**: Assign a clear and descriptive title to the document.
   * **Description (Optional)**: Provide an optional description to offer additional context or information about the document's content.
5. **Save Document**: Click the "Save" or "Create" button to add the document to the project's knowledge base.

<figure><img src="../assets/image (5).png" alt="" /><figcaption></figcaption></figure>

### Organizing and Maintaining Documents

* **Document Listing**: Ayushma presents a list of all documents associated with the project, allowing admins to easily view and manage the collection.
* **Search and Filtering**: Admins can search for specific documents by title or content, making it efficient to locate relevant information. Filtering options based on document type or other criteria might also be available.
* **Editing Documents**: Admins can edit the title, description, and potentially the content of existing documents as needed. This allows for updates, corrections, or refinements to the knowledge base.
* **Deleting Documents**: Admins can remove documents from the project if they become outdated, irrelevant, or inaccurate.

### Insights

* **Document Processing**: The code suggests that Ayushma might employ techniques like optical character recognition (OCR) to extract text from uploaded documents, such as PDFs, making the information accessible for the AI assistant.
* **Text Extraction from URLs**: When adding a URL as a reference document, Ayushma likely utilizes web scraping or similar methods to extract the relevant text content from the linked page.
* **Vector Database**: The code indicates that Ayushma may utilize a vector database to store and manage document embeddings, which are numerical representations of the documents' semantic meaning. This enables efficient similarity search and retrieval of relevant information during conversations.

### Benefits of Effective Reference Document Management

* **Improved AI Accuracy**: Providing the AI assistant with a comprehensive and well-maintained knowledge base leads to more accurate and reliable responses to user queries.
* **Domain-Specific Expertise**: Admins can curate collections of documents that align with the specific medical domain or area of focus of each project, enhancing the AI's expertise and relevance.
* **Efficient Information Retrieval**: Organizing and indexing documents allows for efficient retrieval of relevant information during conversations, leading to faster and more comprehensive responses.
* **Adaptability**: Admins can easily update and expand the knowledge base as new information becomes available, ensuring the AI assistant remains current and adaptable to evolving medical knowledge.

### Upsert Types and Pinecone Integration

Ayushma supports three primary methods for upserting reference documents into the knowledge base:

* **File Upload**: Admins can upload files directly from their local systems. The supported file formats may include PDF, TXT, DOCX, and other text-based documents. Ayushma processes these files, extracts the text content, and stores the information in the vector database.
* **URL Linking**: By providing a URL to a website or online resource, admins can instruct Ayushma to extract the textual content from the linked page. This is useful for incorporating information from online medical journals, research papers, or other web-based sources.
* **Text Input**: Admins can directly input or paste text content into the designated text area within the document management interface. This allows for quick addition of small snippets of information or manually curated text.

### **Pinecone Integration**

Ayushma leverages Pinecone, a vector database, to store and manage the semantic representations of reference documents. Here's how it works:

1. **Embedding Generation**: When a document is upserted (either through file upload, URL linking, or text input), Ayushma generates embeddings for the document's text content. Embeddings are numerical representations that capture the semantic meaning of the text.
2. **Vector Storage**: These embeddings are stored in the Pinecone vector database, along with relevant metadata such as the document's title, description, and unique identifier.
3. **Similarity Search**: During a conversation, when the AI assistant needs to retrieve relevant information, it generates embeddings for the user's query and performs a similarity search in the Pinecone database.
4. **Document Retrieval**: The documents with the most similar embeddings to the query are retrieved and used to inform the AI assistant's response. This ensures that the responses are grounded in the provided reference materials and are contextually relevant.
