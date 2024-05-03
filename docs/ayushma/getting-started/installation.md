# Installation

This section outlines the installation process for both the Ayushma front-end and back-end components.

## Front-end Installation

### **Prerequisites**

* **Node.js and npm (or yarn):** Ayushma is built using JavaScript and requires Node.js and a package manager (npm or yarn) to be installed. Download and install the latest LTS version of Node.js from the official website: [https://nodejs.org/](https://nodejs.org/)
* **Git:** Ayushma's source code is hosted on GitHub, so you'll need Git to clone the repository. Download and install Git from the official website: [https://git-scm.com/](https://git-scm.com/)

### **Installation Steps**

1. **Clone the Repository:** Open a terminal or command prompt and navigate to the directory where you want to install Ayushma. Then, clone the repository using the following command:

```
git clone https://github.com/coronasafe/ayushma_fe.git
```

1. **Navigate to the Project Directory:**

```
cd ayushma_fe
```

1. **Install Dependencies:** Install the required dependencies using either npm or yarn:

```
# Using npm
npm install
```

```
# Using yarn
yarn install
```

This command will download and install all the necessary packages for Ayushma's front-end to run.

## Back-end Installation

### **Prerequisites**

* **Python 3.8+:** Ayushma's back-end is built using Python. Ensure you have Python 3.8 or a newer version installed. Download and install Python from the official website: [https://www.python.org/](https://www.python.org/)
* **Postgres 15+:** Ayushma utilizes PostgreSQL as its database system. Install PostgreSQL 15 or a newer version. Download and install PostgreSQL from the official website: [https://www.postgresql.org/](https://www.postgresql.org/)
* **OpenAI Account with API Key:** Ayushma integrates with OpenAI for its AI capabilities. You'll need an OpenAI account with a valid API key. Create an account and obtain your API key from the OpenAI website: [https://openai.com/](https://openai.com/)
* **Pinecone Account with API Key:** Ayushma uses Pinecone for vector storage. You'll need a Pinecone account with a valid API key and an active index. Sign up and set up your index on the Pinecone website: [https://www.pinecone.io/](https://www.pinecone.io/)

### **Optional Prerequisites:**

* **Docker:** For simplified deployment and environment management, consider using Docker. Download and install Docker from the official website: [https://www.docker.com/](https://www.docker.com/)
* **AWS SES Account:** If you want to enable email functionality, such as password resets, you'll need an AWS SES account.
* **AWS S3 Account:** For document storage, you can optionally use AWS S3.
* **Google Cloud Account with Speech-to-Text API Access:** To enable speech-to-text functionality, you'll need a Google Cloud account with access to the Speech-to-Text API.

### **Installation Steps**

1. **Create a Virtual Environment:** It is recommended to create a virtual environment to isolate Ayushma's dependencies from other Python projects. Use the following command:

`python3 -m venv .venv`

1. **Activate the Virtual Environment:**

```
# On Linux/macOS
source .venv/bin/activate
```

```
# On Windows
.venv\Scripts\activate
```

1. **Install Requirements:** Install the required Python packages using pip:

`pip install -r requirements/local.txt`

1. **Set Environment Variables:** Ayushma's back-end relies on several environment variables for configuration. You can set these variables in your virtual environment's activation script or using a tool like python-dotenv. Refer to the README file in the back-end code for a complete list of environment variables and their descriptions.
2. **Create Database:** Use the psql command-line tool or a PostgreSQL client to create a new database for Ayushma.

`CREATE DATABASE ayushma;`

1. **Apply Migrations:** Run the following command to apply the database migrations:

`python manage.py migrate`

This command will create the necessary tables and schema in the database.

1. **Create Superuser:** Create a superuser account for managing Ayushma through the admin interface.

`python manage.py createsuperuser`

Follow the prompts to set the username, email, and password for the superuser account.

### Additional Configuration

* **Email Configuration (Optional):** If you have set up an AWS SES account and want to enable email sending, configure the email settings in core/settings/local.py or core/settings/production.py according to your SES credentials.
* **Document Storage (Optional):** If you prefer to use AWS S3 for document storage, configure the S3 settings in your environment variables and settings file.
* **Google Cloud Speech-to-Text (Optional):** To enable speech-to-text functionality, set the GOOGLE\_APPLICATION\_CREDENTIALS environment variable to the path of your Google Cloud credentials JSON file.

### Verification

1. **Start the Development Server:**

`python manage.py runserver`

This will start the Django development server, making the back-end API accessible at [http://127.0.0.1:8000/](http://127.0.0.1:8000/).
