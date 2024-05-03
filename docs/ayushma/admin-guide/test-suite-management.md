# Test Suite Management

Test suite management in Ayushma enables admins to evaluate and fine-tune the AI assistant's performance through the creation and execution of test suites. These suites consist of sets of questions and their corresponding expected answers, allowing for systematic evaluation of the AI's accuracy, relevance, and overall effectiveness.

<figure><img src="../assets/image (9).png" alt="" /><figcaption></figcaption></figure>

### What is a Test Suite?

A test suite is a collection of test cases designed to assess specific aspects of the AI assistant's capabilities. Each test case within a suite typically includes:

* **Question**: The query or prompt presented to the AI assistant.
* **Expected Answer**: The reference answer that represents the desired or ideal response from the AI.
* **Language**: The language in which the question and expected answer are provided.

### Creating a Test Suite

<figure><img src="../assets/image (10).png" alt="" /><figcaption></figcaption></figure>

1. **Access Test Suites**: Navigate to the "Test Suites" section within the admin dashboard.
2. **Initiate Suite Creation**: Click the "New Test Suite" or a similar option to start the process.
3. **Provide Suite Name**: Enter a descriptive name for the test suite.
4. **Configure Suite Parameters**:
   * **Temperature**: Adjust the temperature parameter to control the creativity and randomness of the AI's responses. A lower temperature leads to more deterministic and factual outputs, while a higher temperature encourages more diverse and creative responses.
   * **Top K**: Set the top k parameter to determine the number of potential responses considered by the AI during generation. A lower top k value results in more focused and concise answers, while a higher value allows for a wider range of possibilities.
5. **Add Test Cases**:
   * **Question**: Input the question or prompt for the test case.
   * **Expected Answer**: Provide the expected or reference answer for the question.
   * **Language**: Select the language of the question and answer.
   * **(Optional) Add Reference Documents**: Attach relevant documents that the AI can utilize as a knowledge base when answering the question.
6. **Save Test Suite**: Click the "Create" or "Save" button to finalize the test suite creation.

### Running a Test Suite

1. **Select Test Suite**: Choose the desired test suite from the list of available suites.
2. **Configure Run Settings**:
   * **Project**: Select the project against which the test suite will be run. This determines the AI model and project-specific knowledge base used during the evaluation.
   * **(Optional) References**: Choose whether the AI assistant should utilize reference documents during the test run.
3. **Initiate Test Run**: Click the "Run" button to start the evaluation process.
4. **Monitor Progress**: Ayushma might display the progress of the test run, indicating the number of completed test cases and the overall status.
5. **Review Results**: Once the test run is complete, admins can review the results, including:
   * **Individual Test Case Outcomes**: Each test case will show the AI's generated answer alongside the expected answer, allowing for a direct comparison.
   * **Evaluation Metrics**: Ayushma might provide quantitative metrics such as BLEU score and cosine similarity to assess the quality and relevance of the AI's responses.
   * **Feedback**: Admins or reviewers might have the option to provide feedback on individual test cases, offering qualitative insights and suggestions for improvement.

### Benefits of Test Suite Management

* **Performance Evaluation**: Test suites provide a structured approach to evaluating the AI assistant's performance across various scenarios and identifying areas where improvement is needed.
* **Model Comparison**: Admins can run test suites against different AI models to compare their performance and choose the most suitable model for a given project or use case.
* **Continuous Improvement**: Regular testing and analysis using test suites facilitate continuous improvement of the AI assistant's capabilities and ensure it remains effective and reliable over time.
* **Quality Assurance**: Test suites play a crucial role in quality assurance by ensuring that the AI assistant meets the expected standards of accuracy, relevance, and safety before deployment or integration into real-world medical applications.
