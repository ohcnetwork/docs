# Conversation Flow

The following diagram illustrates the flow of a conversation in Ayushma, including API endpoints, database models, and integrations with external services.

<figure><img src="../assets/image (2).png" alt="" /><figcaption></figcaption></figure>

**Explanation:**

1. **User Input:** The user initiates a conversation by providing input either through text or audio.
2. **Language Selection:** The user selects the desired language for the conversation.
3. **Chat Creation:** The front-end calls the Chat Creation API endpoint to create a new chat session in the database. This generates a unique Chat ID.
4. **Converse API:** The front-end calls the Converse API endpoint with the Chat ID and user input.
5. **Conditional Logic:**
   * **Text Input:** If the user provided text input, it is sent directly to the Converse API with the text parameter.
   * **Audio Input:** If the user provided audio input, the Speech-to-Text API is called first to transcribe the audio into text. The transcribed text is then sent to the Converse API.
6. **OpenAI API / Pinecone:** The back-end processes the user's query and interacts with the OpenAI API or Pinecone index to generate a response.
7. **AI Response:** The AI generates a response based on the user's query and available information.
8. **Translate?:** If the user's selected language is not English, the AI response is translated to the target language using a translation API.
9. **Text-to-Speech?:** If audio output is enabled, the AI response (translated or in English) is converted into speech using a Text-to-Speech API. This generates an audio file.
10. **Store ChatMessage:** The response, along with any generated audio, is stored as a ChatMessage in the database, associated with the corresponding Chat and Project.
11. **Response:** The final response, either as text or audio, is sent back to the user through the front-end interface.

**Database Models Involved:**

* **ChatMessage:** Stores individual messages within a chat session.
* **Chat:** Represents a chat session with a title, user, project, and list of associated messages.
* **Project:** Defines the configuration and settings for a specific project, including the prompt, API keys, and document references.
* **Document:** Represents a document that has been ingested into Ayushma for reference during conversations.

**External Services and Integrations:**

* **Speech-to-Text Engine:** Whisper or Google Speech-to-Text is used to transcribe audio input into text.
* **Text-to-Speech Engine:** OpenAI or Google Text-to-Speech is used to convert text responses into speech.
* **Pinecone Index:** Stores vector embeddings of documents for efficient retrieval during conversations.
* **OpenAI API:** Provides access to OpenAI's language models for generating responses and performing other AI tasks.
* **Translation API:** Facilitates real-time translation of messages between different languages.
