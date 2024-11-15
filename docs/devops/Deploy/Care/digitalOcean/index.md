### **Deploying Care on DigitalOcean**

In this guide, we’ll walk you through deploying **Care**, on **DigitalOcean**. We’ll keep things simple & you can simply follow along to get your instance up and running. Expect the process to take about **an hour**, depending on your familiarity with the tools.

---

### **Prerequisites**
- A DigitalOcean account ([Sign up here](https://www.digitalocean.com)).
- A fork of the Care backend and frontend repositories.
- A registered domain name (optional but recommended).
- Basic familiarity with DigitalOcean's App Platform and Spaces.

---

### **What You’ll Be Doing**

We’ll guide you step by step to:
- Set up a **PostgreSQL database** for secure data storage.
- Configure **DigitalOcean Spaces** for handling files and media.
- Deploy the **Care backend** with Redis and Celery for task management.
- Set up the **Care frontend** for users to access.
- Secure the setup with custom domains, API keys, and SSL.
- Setup a CI/CD Pipeline for Continuous Deployment

---

### **Ready to Start?**

Grab a coffee and prepare to bring your Care application to life on DigitalOcean. Let’s dive in! 🌟

---

## **Step 1: Create the Database**

1. **Navigate to Databases:**
   - Log in to DigitalOcean and go to the **Databases** section.

2. **Create a PostgreSQL Database:**
   - Click **Create Database**.
   - Choose the following:
     - **Region**: Select the nearest data center.
     - **Engine**: PostgreSQL (Version 16).
     - **Resources**: Select a plan based on your requirements.
     - **Name**: Give your database a unique name.
     - **Tags**: Add tags for organization.

3. **Save Connection Details:**
   - Once the database is created, note the connection URL for later use.

📌 **Screenshot Placeholder:** *Example of DigitalOcean database creation.*

---

## **Step 2: Set Up Object Storage (Spaces)**

1. **Navigate to Spaces:**
   - Go to the **Spaces** section in DigitalOcean.

2. **Create a New Space:**
   - Click **Create a Space**.
   - Choose:
     - **Region**: Select the same region as your database.
     - **Enable CDN**: For faster file delivery.
     - **Bucket Name**: Enter a unique name.

3. **Generate API Keys:**
   - Go to the **API** tab and click **Spaces Keys**.
   - Create a new key pair and save the **Key** and **Secret**.

📌 **Screenshot Placeholder:** *Creating Spaces and generating API keys.*

---

## **Step 3: Deploy the Care Backend (BE)**

### **Step 3.1: Deploy Redis**
1. **Set Up Redis:**
   - Go to the App Platform and click **Create App**.
   - Choose **Docker Hub** as the source and use:
     - **Repository**: `redis/redis-stack-server`.
     - **Tag**: `6.2.6-v10`.
     - **Port**: Expose `6379` as an internal port.

2. **Name and Deploy:**
   - Name the component `redis` and deploy it.

📌 **Screenshot Placeholder:** *Configuring Redis in DigitalOcean.*

---

### **Step 3.2: Deploy the Care Backend**
1. **Fork and Clone the Repository:**
   - Fork the [Care Backend Repository](https://github.com/ohcnetwork/care).
   - Use the `production` branch for deployment.

2. **Set Up the App:**
   - Click **Create App** and choose **From Source Code**.
   - Select your forked repo and branch.
   - Set the build and run commands:
     - **Build Command:**
       ```bash
       python install_plugins.py && python manage.py collectstatic --noinput && python manage.py compilemessages
       ```
     - **Run Command:**
       ```bash
       gunicorn config.wsgi:application --workers 2 --bind :9000
       ```

3. **Environment Variables:**
   - Add the following:
     ```bash
     DJANGO_SETTINGS_MODULE=config.settings.production
     DATABASE_URL=<db-url>
     REDIS_URL=redis://redis:6379
     ...
     ```

4. **Expose Ports:**
   - Expose `9000` for public HTTP access.

📌 **Screenshot Placeholder:** *Setting up the Care backend app.*

---

### **Step 3.3: Add a Domain for the Backend**
1. **Configure Domain:**
   - Go to the app settings and add your domain (e.g., `care-api.example.com`).
   - Update your DNS provider with the CNAME record.

📌 **Screenshot Placeholder:** *Domain configuration example.*

---

### **Step 3.4: Set Up Celery Worker and Beat**
1. **Celery Worker:**
   - Create a new component in the app.
   - Use:
     - **Run Command:**
       ```bash
       celery --app=config.celery_app worker --max-tasks-per-child=6 -B --loglevel=info
       ```

2. **Celery Beat:**
   - Create another component with:
     - **Run Command:**
       ```bash
       python manage.py migrate && python manage.py load_redis_index
       ```

📌 **Screenshot Placeholder:** *Setting up Celery Worker and Beat.*

---

## **Step 4: Deploy the Care Frontend (FE)**

1. **Fork the Frontend Repo:**
   - Fork the [Care Frontend Repository](https://github.com/ohcnetwork/care_fe).
   - Use the `production` branch.

2. **Set Up the App:**
   - Click **Create App** and configure:
     - **Type**: Static Site.
     - **Build Command:** `npm run build`.
     - **Environment Variable:**
       ```bash
       REACT_APP_API_URL=https://care-api.example.com
       ```
     - **Output Directory:** Auto.

3. **Add Domain:**
   - Go to app settings and add the frontend domain (e.g., `care.example.com`).

📌 **Screenshot Placeholder:** *Frontend app setup.*

---

## **Step 5: Secure Database Access**

1. **Restrict Access:**
   - Navigate to the Database settings.
   - Add the Care backend app as a trusted source.

📌 **Screenshot Placeholder:** *Restricting database access.*

---

## **Step 6: Configure CORS for Spaces**

1. **Go to Bucket Settings:**
   - Open your bucket in Spaces.
   - Add the following CORS configuration:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
         "AllowedOrigins": ["https://example.com"],
         "ExposeHeaders": []
       }
     ]
     ```

📌 **Screenshot Placeholder:** *CORS configuration example.*

---

## **Final Steps**

- **Verify Deployment:**
  - Test the backend and frontend by accessing the respective domains.
  - Ensure all components (Redis, Celery Worker, Beat) are running.

- **Optimize Security:**
  - Use SSL certificates (e.g., Let’s Encrypt) to enable HTTPS.
  - Configure firewall rules to restrict access.

📌 **Diagram Placeholder:** *Overall architecture diagram.*

---

## **Conclusion**

You’ve successfully deployed the Care application on DigitalOcean! With the database, object storage, backend, and frontend configured, your application is ready for use. 🚀

For troubleshooting, feel free to join our Community on Slack at [slack.ohc.network](https://slack.ohc.network); You may also refer to the official [DigitalOcean Documentation](https://www.digitalocean.com/docs) for anything question about Digital Ocean
