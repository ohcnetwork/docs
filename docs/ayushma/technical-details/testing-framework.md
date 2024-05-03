# Testing Framework

The Ayushma Testing Framework is a custom-built, web-based framework designed for automated testing of AI responses to predefined questions. Operating with Python and Celery workers, this precision-engineered framework enables admins to post predefined question sets. Built with precision, the testing framework allows admins to post predefined sets of questions. These questions, when run through the AI, enable the assessment of the accuracy and relevance of the generated responses.

<figure><img src="../assets/image (6).png" alt=""><figcaption></figcaption></figure>

### Purpose of the Testing Framework

The Ayushma Testing Framework is integral to ensuring the AI's accuracy and reliability. Custom-built for this specific application, it allows users to conduct automated tests to evaluate the AI's response accuracy against predefined medical queries.

### Test Suite Structure

Test suites are organized within the ayushma/models/testsuite.py file and consist of several interrelated models:

* **TestSuite**: Represents a collection of test cases with a name, temperature setting, and top k parameter. These parameters control the behavior of the AI model during test runs.
* **TestQuestion**: Defines an individual test case with fields for the question, expected answer, language, and optionally attached reference documents.
* **TestRun**: Represents an execution of a test suite against a specific project, storing information about the start and end times, status (e.g., running, completed, failed), and the associated test results.
* **TestResult**: Stores the results of an individual test case within a test run, including the AI's generated answer, cosine similarity, BLEU score, and any relevant feedback.
* **Feedback**: Allows admins or reviewers to provide qualitative feedback and ratings on individual test cases.

### Test Execution Workflow

1. **Test Run Creation**: When an admin initiates a test run, a new TestRun instance is created, associated with the chosen test suite and project.
2. **Asynchronous Task**: A Celery task is triggered to execute the test suite asynchronously. This task fetches the test questions from the selected TestSuite and iterates through them.
3. **AI Response Generation**: For each TestQuestion, the task utilizes the converse function from ayushma/utils/openaiapi.py to generate the AI's response. This function interacts with the specified AI model, taking into account the test suite's temperature and top k parameters, as well as any attached reference documents.
4. **Evaluation**: The AI's generated answer is compared with the expected answer from the TestQuestion using metrics like cosine similarity and BLEU score.
5. **Result Storage**: A TestResult instance is created for each test case, storing the question, expected answer, AI's answer, and evaluation metrics.
6. **Status Update**: Upon completion of all test cases, the TestRun instance is updated with the final status (e.g., completed or failed).

### Evaluation Metrics

* **Cosine Similarity**: Measures the semantic similarity between the AI's generated answer and the expected answer, indicating how well the AI understood the query's meaning and context.
* **BLEU Score**: Assesses the overlap and fluency of the AI's response compared to the reference answer, providing insights into the quality and grammatical correctness of the generated text.

### Feedback Mechanism

* **Feedback Model**: The Feedback model allows admins and reviewers to provide qualitative feedback on individual test cases. They can input text comments and assign ratings based on criteria such as accuracy, helpfulness, and safety.
* **Feedback Interface**: The admin panel provides an interface for viewing test run results and submitting feedback on individual test cases.

### Code Snippets

**Test Run Creation (views.py)**

```python
def perform_create(self, serializer):
    # ... 
    test_run = serializer.save(test_suite=test_suite, project=project)
    
    mark_test_run_as_completed.delay(test_run.id)
    # ...
```

**Asynchronous Test Execution (tasks.py)**

```python
@shared_task(bind=True, soft_time_limit=21600)
def mark_test_run_as_completed(self, test_run_id):
    # ...
    for test_question in test_questions:
        # ...
        ai_response = converse_thread(
           # ... 
        )
        # ... Calculate cosine similarity and BLEU score
        # ... Save TestResult
    # ...
```

### Benefits and Considerations

* **Automated Evaluation**: The testing framework enables automated evaluation of the AI assistant's performance, reducing manual effort and ensuring consistency.
* **Quantitative Metrics**: Cosine similarity and BLEU score provide objective measures of the AI's responses, facilitating data-driven analysis and improvement.
* **Qualitative Feedback**: The feedback mechanism allows for human insights and nuanced evaluation of the AI's responses, complementing the quantitative metrics.
* **Continuous Improvement**: The testing framework supports continuous improvement of the AI assistant by providing a structured process for identifying and addressing performance issues.
* **Maintainability**: The modular design and clear separation of concerns within the testing framework contribute to its maintainability and extensibility.

\
