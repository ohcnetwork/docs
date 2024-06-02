# Upserting Documents

Upserting documents into Ayushma's knowledge base involves processing various document formats, extracting text content, generating embeddings, and storing the information in a vector database for efficient retrieval during conversations.

### Upserting Process

1. **Document Submission**: Admins initiate the upsert process by providing a document through one of the supported methods:
   * **File Upload**: Uploading a file from their local system (e.g., PDF, TXT, DOCX).
   * **URL Linking**: Providing a URL to a webpage or online resource.
   * **Text Input**: Directly entering or pasting text content.
2. **Document Type Determination**: Ayushma determines the document type (file, URL, or text) based on the input method.
3. **Text Extraction**:
   * **File Uploads**: For file uploads, Ayushma utilizes libraries like PyPDF2 (for PDFs) or plain text readers to extract the text content from the document. OCR (Optical Character Recognition) might be employed for image-based PDFs.
   * **URL Linking**: For URLs, Ayushma fetches the webpage content and uses libraries like BeautifulSoup to parse the HTML and extract relevant text.
4. **Text Processing**: The extracted text is preprocessed, which may involve steps like:
   * **Cleaning**: Removing irrelevant characters, HTML tags, or formatting.
   * **Normalization**: Converting text to lowercase, handling diacritics, etc.
   * **Tokenization**: Splitting the text into individual words or subwords.
5. **Embedding Generation**: Ayushma uses a pre-trained embedding model (e.g., OpenAI's text-embedding-ada-002) to generate embeddings for the processed text. These embeddings capture the semantic meaning of the text as numerical vectors.
6. **Vector Storage**: The generated embeddings, along with relevant metadata (document title, description, ID), are stored in the Pinecone vector database under the namespace of the associated project.
7. **Background Processing (Celery)**: For large documents or URL extractions, the upserting process might be handled as a background task using Celery to avoid blocking the main application thread.

### Code Snippets

**Upsert Function (utils/upsert.py)**

```python
def upsert(external_id, document_id, s3_url=None, url=None, text=None):
    # ...
    if s3_url:
        document_text = read_document(s3_url)
        document_lines = document_text.strip().splitlines()
    # ... handle url and text cases
    
    # Generate embeddings and upsert to Pinecone
    # ...
```

**Document Processing and Embedding Generation**

```python
def read_document(url):
    # ... handle different file types and URL extractions
    return document_text

def get_embedding(text, model="text-embedding-ada-002", openai_api_key=settings.OPENAI_API_KEY):
    # ... generate embeddings using OpenAI API
    return embeddings
```

### Design Considerations

* **Document Format Support**: Ayushma should support a wide range of document formats to accommodate various use cases and data sources.
* **Text Extraction Accuracy**: The text extraction process, particularly for complex file formats or webpages, should be robust and accurate to ensure the quality of the stored information.
* **Embedding Model Selection**: Choosing an appropriate embedding model is crucial for effective retrieval. The model should align with the nature of the documents and the expected use cases.
* **Vector Database Optimization**: Configuring the Pinecone index appropriately and optimizing query parameters impact retrieval speed and accuracy.
* **Asynchronous Processing**: Using Celery for background tasks ensures responsiveness and prevents the upserting process from blocking user interactions.
