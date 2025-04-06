# ☁️ Google Cloud Storage (GCS) Integration Guide

This guide explains how to set up and integrate **Google Cloud Storage (GCS)** with the CARE project, which uses Django Rest Framework (backend) and React TypeScript (frontend).

## 📋 Prerequisites

To use GCS with CARE, ensure you have the following:

- A Google Cloud Platform (GCP) account
- A GCS bucket created in your GCP project
- A service account with **Storage Admin** permissions
- Python and Node.js installed as per the CARE setup guide

## 🔐 Authentication Setup

### 1. Create a GCP Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **Create Service Account**
3. Assign the **Storage Admin** role
4. Go to **Keys → Add Key → Create New Key → JSON**, and download the credentials file

> 🔒 **Important**: Never commit this key to the repository.

### 2. Set Environment Variable

In your backend (Django) environment:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account.json"
For Dockerized environments, you can add this to .env:

env
Copy
Edit
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/service-account.json
And mount the file when running the container.

⚙️ Backend Integration (Django)
Install Required Package
bash
Copy
Edit
pip install google-cloud-storage
Example Usage in Django View
python
Copy
Edit
from google.cloud import storage

def upload_to_gcs(file_obj, bucket_name, destination_blob_name):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_file(file_obj)
    return blob.public_url
⚙️ Frontend Handling (React TS)
Files should be uploaded via API endpoints to the backend, which handles GCS operations. Use FormData for file input.

ts
Copy
Edit
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  await fetch("/api/upload", 
  {
    method: "POST",
    body: formData,
  });
};
🧪 Testing Locally
Verify the GOOGLE_APPLICATION_CREDENTIALS env is set

Use Postman or the CARE frontend to upload files via the configured endpoint

Check GCS console to confirm upload

🛠️ Troubleshooting
Problem	Solution
403 Permission Denied	Ensure correct IAM role and bucket access
Credentials file not found	Double-check env variable and path
Upload fails in Docker	Ensure file is mounted and accessible inside the container