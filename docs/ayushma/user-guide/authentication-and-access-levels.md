# Authentication and Access Levels

Authentication is the process of verifying a user's identity before granting access to Ayushma's features and functionalities. Ayushma provides options for both registration and login to ensure secure access to the platform.

### Registration

To create a new account on Ayushma, follow these steps:

1. **Access the Registration Page:** Navigate to the registration page of Ayushma's web interface. This page will typically be available at a URL such as [https://ayushma.ohc.network/register](https://ayushma.ohc.network/register).
2. **Provide User Details:** Fill in the required information, which typically includes:
   * **Full Name:** Your full name.
   * **Username:** A unique username for your account.
   * **Email:** Your email address, which will be used for communication and account recovery.
   * **Password:** A secure password for your account.
3. **Complete reCAPTCHA (Optional):** If Ayushma is configured to use Google reCAPTCHA for bot prevention, complete the reCAPTCHA challenge to proceed.
4. **Submit Registration:** Click the "Register" button to submit your registration request.

Upon successful registration, you will receive a confirmation email or be redirected to the login page.

### Login

1. **Access the Login Page:** Go to the login page of Ayushma's web interface. The URL will typically be similar to [https://ayushma.ohc.network/login](https://ayushma.ohc.network/login).
2. **Enter Credentials:** Provide your registered email address and password in the respective fields.
3. **Submit Login:** Click the "Login" button to authenticate and access your account.

If you have entered the correct credentials, you will be logged in and redirected to your Ayushma dashboard or the main chat interface.

### Forgot Password

1. **Access Forgot Password Page:** Go to the forgot password page, which might be at a URL like [https://ayushma.ohc.network/forgot-password](https://ayushma.ohc.network/forgot-password).
2. **Enter Email:** Enter the email address associated with your Ayushma account.
3. **Request a reset link:** Click on Reset button to receive a password reset link in your email
4. **Click the reset link: Click on the password reset link in your email**
5. **Set New Password:** Choose a new password for your account and confirm it.
6. **Reset Password:** Click the "Reset" button to update your password.

You should now be able to log in to your Ayushma account using your new password.

### Access Levels

Ayushma implements different access levels to control user permissions and ensure appropriate data access within the platform.

**1. User**

* **Basic Access:** Users have access to the core functionalities of Ayushma, including:
  * Creating and managing chat sessions.
  * Interacting with the AI through the chat interface.
  * Viewing conversation history.
  * Customizing settings such as language preferences and display options.
* **Limited Project Access:** Users can access and use projects that are marked as "default" or have been explicitly shared with them. They cannot create or modify projects unless granted additional permissions.

**2. User with Access Key Allowed**

* **Extended Capabilities:** In addition to the basic user access, users with "Access Key Allowed" have the ability to:
  * Use their own OpenAI API key for conversations. This allows for greater flexibility and control over the AI model used and the associated costs.

**3. Admin**

* **Full Privileges:** Admin users have complete control over the Ayushma platform, including:
  * **User Management:** Creating, editing, and deleting user accounts. Assigning roles and permissions to users (User, User with Access Key Allowed, Admin).
  * **Project Management:** Creating, editing, and deleting projects. Configuring project settings such as prompts, API keys, and document references. Archiving and unarchiving projects. Setting a project as the default project.
  * **Test Suite Management:** Creating, editing, and deleting test suites. Adding and managing test questions, attaching documents, and running test runs. Analyzing test results and providing feedback.
  * **System Configuration:** Managing system-level settings and configurations.

Access levels are typically assigned by an administrator during user creation or modification. The appropriate access level ensures that users have the necessary permissions for their roles while maintaining data security and integrity.
