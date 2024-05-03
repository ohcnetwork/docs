# Environment Variables - Staging and Production

## Ayushma Environment Setup

Ayushma provides options for both staging and production environments to facilitate testing and deployment.

### Staging Environment

* **Staging Deployment**: Access the staging deployment of Ayushma at [https://ayushma-staging.ohc.network](https://ayushma-staging.ohc.network). This environment allows you to explore the application's features and functionality with sample data.
*   **API Credentials**:

    * Email: `demo@ayushma.ohc.network`
    * Password: `Demo@Ayu`

    Use code with caution.

You can also register as a new user in the staging environment.

### Production Environment

* **Production Deployment**: The production deployment of Ayushma is available at [https://ayushma.ohc.network](https://ayushma.ohc.network). This environment reflects the latest stable version of the application.
* **API Credentials**: For the production environment, you'll need to set up your own user accounts and API keys.

### Environment Variables

Ayushma utilizes environment variables for configuration in both the front-end and back-end. These variables allow you to customize various aspects of the application's behavior.

#### Front-end Environment Variables (.env or .env.local):

| Variable                                | Description                                                        | Default Value                                  |
| --------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                   | Backend API URL                                                    | `https://ayushma-api.ohc.network/api/`         |
| `NEXT_PUBLIC_LOCAL_STORAGE`             | Local storage key name for storing user preferences                | `ayushma-storage`                              |
| `NEXT_PUBLIC_AI_NAME`                   | Name of the AI assistant displayed in the chat interface           | `Ayushma`                                      |
| `NEXT_PUBLIC_AI_DESCRIPTION`            | Description of the AI assistant displayed on the home page         | `Revolutionizing medical diagnosis through AI` |
| `NEXT_PUBLIC_AI_WARNING`                | Warning message regarding the accuracy of AI-generated information | `Please be aware that Ayushma AI may...`       |
| `NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key (optional)                               | `6Lerts4nAAAAAKyXaNZkYj4XfRO0M2R-XYIA3qv8`     |

#### Back-end Environment Variables (.env):

| Variable                         | Description                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `AI_NAME`                        | Name of the AI assistant (default: Ayushma)                                      |
| `OPENAI_API_KEY`                 | OpenAI API Key                                                                   |
| `PINECONE_API_KEY`               | Pinecone API Key                                                                 |
| `PINECONE_ENVIRONMENT`           | Pinecone Environment                                                             |
| `PINECONE_INDEX`                 | Pinecone Index Name                                                              |
| `CURRENT_DOMAIN`                 | Current Domain where the front-end is hosted (e.g., https://ayushma.ohc.network) |
| `EMAIL_HOST`                     | SES Email Host (Optional)                                                        |
| `EMAIL_USER`                     | SES Email User (Optional)                                                        |
| `EMAIL_PASSWORD`                 | SES Email Password (Optional)                                                    |
| `GOOGLE_APPLICATION_CREDENTIALS` | Google Cloud Credentials (Optional) for Speech-to-Text                           |
| `S3_SECRET_KEY`                  | AWS S3 Secret Key (Optional)                                                     |
| `S3_KEY_ID`                      | AWS S3 Key ID (Optional)                                                         |
| `S3_BUCKET_NAME`                 | AWS S3 Bucket Name (Optional)                                                    |
| `S3_REGION`                      | AWS S3 Region (Optional)                                                         |
| `GOOGLE_RECAPTCHA_SECRET_KEY`    | Google reCAPTCHA Secret Key (Optional)                                           |
| `SELF_HOSTED_ENDPOINT`           | URL for self-hosted speech-to-text (Optional)                                    |
