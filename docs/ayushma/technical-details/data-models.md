# Data Models

Ayushma's data models, defined in the `ayushma/models` directory, represent the core entities and relationships within the application, providing the structure for storing and managing data.

### **User Model**

`ayushma/models/users.py`

* **Fields:**
  * `external_id` (UUID): Unique identifier for the user.
  * `full_name` (CharField): User's full name (optional).
  * `email` (EmailField): User's email address, used as username.
  * `allow_key` (BooleanField): Allows user to use their own OpenAI API key.
  * `is_reviewer` (BooleanField): Indicates if the user has reviewer privileges.
  * Inherited from `AbstractUser`:
    * `password`, `last_login`, `is_staff`, `is_active`, `date_joined`, `first_name`, `last_name`, `is_superuser`, `groups`, `user_permissions`, `last_login_platform`, `last_login_ip`, `modified_at`

### **Project Model**

`ayushma/models/project.py`

* **Fields:**
  * `external_id` (UUID): Unique identifier for the project.
  * `title` (CharField): Project name.
  * `description` (TextField): Optional project description.
  * `creator` (ForeignKey): Links to User model, denotes the project creator.
  * `prompt` (TextField): Optional instructions for the AI assistant.
  * `assistant_id` (CharField): ID of the linked OpenAI assistant.
  * `open_ai_key` (CharField): Project-specific OpenAI API key.
  * `stt_engine`, `tts_engine`, `model` (IntegerField): Configurations for speech and AI model.
  * `preset_questions` (ArrayField): Preset questions for the project.
  * `is_default`, `archived` (BooleanField): Status flags for the project.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

## **Chat Models**

`ayushma/models/chat.py`

### **Chat**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the chat session.
  * `title` (CharField): Title of the chat session.
  * `user`, `project` (ForeignKey): Links to User and Project models.
  * `prompt` (TextField): Optional chat-specific prompt.
  * `api_key` (ForeignKey): API key used for the chat.
  * `model` (IntegerField): AI model used for the chat.
  * `thread_id` (CharField): Identifier for OpenAI assistant interactions.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **ChatMessage**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the message.
  * `chat` (ForeignKey): Links to Chat model.
  * `messageType` (IntegerField): Type of the message (user, Ayushma, or system).
  * `message` (TextField): Content of the message.
  * `original_message` (TextField): Original message before translation.
  * `language` (CharField): Language of the message.
  * `reference_documents` (ManyToManyField): Referenced documents.
  * `audio` (FileField): Audio file for TTS output.
  * `meta` (JSONField): Additional metadata.
  * `temperature`, `top_k` (FloatField, IntegerField): Parameters for message generation.
  * `noonce` (CharField): Identifier to prevent duplicate messages.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **ChatFeedback**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the feedback.
  * `chat_message` (ForeignKey): Links to ChatMessage model.
  * `liked` (BooleanField): User's approval of the response.
  * `message` (TextField): Additional feedback text.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **Document Model**

`ayushma/models/document.py`

* **Fields:**
  * `external_id` (UUID): Unique identifier for the document.
  * `title` (CharField): Title of the document.
  * `description` (TextField): Optional description of the document.
  * `document_type` (IntegerField): Specifies the type (file, URL, text).
  * `file` (FileField): File object if the document is a file.
  * `text_content` (TextField): Text content of the document.
  * `project` (ForeignKey): Links to the Project model.
  * `test_question` (ForeignKey): Links to the TestQuestion model (if applicable).
  * `uploading`, `failed` (BooleanField): Status flags for uploading and processing.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

## **Test Suite and Test Run Models**

`ayushma/models/testsuite.py`

### **TestSuite**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the test suite.
  * `name` (CharField): Name of the test suite.
  * `temperature` (FloatField): Temperature setting for AI response generation.
  * `topk` (IntegerField): Top k parameter for AI response generation.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **TestQuestion**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the test question.
  * `test_suite` (ForeignKey): Links to TestSuite model.
  * `question` (TextField): The prompt or question for the test case.
  * `human_answer` (TextField): Expected or reference answer.
  * `documents` (ManyToManyField): Attached reference documents.
  * `language` (CharField): Language of the question and answer.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **TestRun**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the test run.
  * `test_suite` (ForeignKey): Links to TestSuite model.
  * `project` (ForeignKey): Links to the Project model.
  * `status` (IntegerField): Current status (running, completed, failed).
  * `references` (BooleanField): Whether reference documents were used.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **TestResult**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the test result.
  * `test_run` (ForeignKey): Links to TestRun model.
  * `test_question` (ForeignKey): Links to TestQuestion model.
  * `question` (TextField): The question from the test case.
  * `human_answer` (TextField): The expected or reference answer.
  * `answer` (TextField): AI's generated answer during the test run.
  * `cosine_sim` (FloatField): Cosine similarity score.
  * `bleu_score` (FloatField): BLEU score of the AI's answer.
  * `references` (ManyToManyField): Reference documents used.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **Feedback**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the feedback.
  * `user` (ForeignKey): Links to the User model.
  * `test_result` (ForeignKey): Links to TestResult model.
  * `rating` (IntegerField): Rating for the test case.
  * `notes` (TextField): Additional feedback notes.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

## **Service-Related Models**

`ayushma/models/services.py`

### **APIKey**

* **Fields:**
  * `external_id` (UUID): Unique identifier for the API key.
  * `title` (CharField): Name or title of the API key.
  * `key` (CharField): API key string.
  * `creator` (ForeignKey): Links to deprecated User model field.
  * `service` (ForeignKey): Links to the Service model.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **TempToken**

*   **Fields:**

    * `external_id` (UUID): Unique identifier for the temporary token.
    * `token` (CharField): Temporary token string.
    * `api_key` (ForeignKey): Links to APIKey model.
    * `ip` (CharField): IP address associated with the token.
    * `expires_at` (DateTimeField): When the token expires.



### **Service Model**

`ayushma/models/services.py`

* **Fields:**
  * `external_id` (UUID): Unique identifier for the service.
  * `name` (CharField): Name of the service.
  * `allow_key` (BooleanField): Indicates if API keys are allowed for the service.
  * `owner` (ForeignKey): Links to the User model, indicating the service owner.
  * Inherited from `BaseModel`: `created_at`, `modified_at`, `deleted`

### **ResetPasswordToken Model**

`ayushma/models/token.py`

* **Fields:**
  * `external_id` (UUID): Unique identifier for the token.
  * `user` (ForeignKey): Links to the User model.
  * `created_at` (DateTimeField): Timestamp of token creation.
  * `key` (CharField): The token string.
  * `ip_address` (GenericIPAddressField): IP address associated with the token generation.
  * `user_agent` (CharField): User agent string associated with the token generation.
  * Inherited from `BaseModel`: `modified_at`, `deleted`

