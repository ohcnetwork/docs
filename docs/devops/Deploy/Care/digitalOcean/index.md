# DigitalOcean

## Setting up the Database

- Navigate to the Databases tab in the DigitalOcean Console.
- Click on the `Create Database` button.
- Select the required datacenter region.
- Choose the default VPC network.
- Choose the PostgreSQL database engine V16.
- Select the CPU, plan, and storage based on the requirements.
- Choose a unique database name.
- Add tags for access control.
- Click on the `Create Database Cluster` button.

## Setting up Spaces

- Navigate to the Spaces Objects Storage tab in the DigitalOcean Console.
- Click on the `Create a Space` button.
- Choose the datacenter region.
- Enable CDN for faster content delivery.
- Select your project.
- Set the bucket name and press on the `Create a Spaces Bucket`.
- Go to the API's tab and select the `Spaces Keys`.
- Generate a new key by giving it a name.
- Note down the generated key and secret for later use.

## Setting up the App Platform

- Decide the domain name for the app.
  - Care FE App: `care.example.com`
  - Care BE App: `care-api.example.com`

### Deploy Care BE App

#### Redis
- Redis Stack Server is used to store the Celery queue and must be set up as a prerequisite for the Care backend.
- Click `Create App`.
- Set the Service Provider to Docker Hub.
- Set the repository to `redis/redis-stack-server`.
- Set the Image tag to `6.2.6-v10`.
- Use the edit option to name the component `redis`.
- Add internal ports for private networking.
- Expose port 6379 as an internal port.
- Save and return to the Resources section.
- Click `Next`.
- Specify the App name and Project.
- Review and create the resource.

#### Care
- Set up the Care Django backend.
- Fork the [care](https://github.com/ohcnetwork/care) repository from [ohcnetwork](https://github.com/ohcnetwork) (ensure to clone the production branch to your repo).
- Click `Create App` and then `Create Resource From Source Code`.
- Set the Service Provider to GitHub.
- Choose the repository `https://github.com/accountname/care` and branch `production`.
- In the Resources tab, edit the `care` component.
- Enable the autodeploy option and choose `/` as the `Source Directory`.
- Use the edit option to specify the resource type as `Web Service`.
- Choose resource size based on the scale.
- Edit the Build Phase and set the `Build Command` to:
  ```
  python install_plugins.py && python manage.py collectstatic --noinput && python manage.py compilemessages
  ```
- Set the `Run Command` to:
  ```
  gunicorn config.wsgi:application --workers 2 --bind :9000
  ```
- Expose the Public HTTP Port `9000`.
- Return from the edit menu and click `Next`.
- Set the **global environment variables** (use the Bulk editor to copy-paste the template and configure):
  ```
  DJANGO_SETTINGS_MODULE=config.settings.production
  SNS_ACCESS_KEY=
  SNS_SECRET_KEY=
  CORS_ALLOWED_ORIGINS=["https://example.com"]
  DATABASE_URL=<db-url>
  SENTRY_ENVIRONMENT=
  SENTRY_TRACES_SAMPLE_RATE=
  SENTRY_PROFILES_SAMPLE_RATE=
  SENTRY_DSN=
  CELERY_BROKER_URL=redis://redis:6379
  REDIS_URL=redis://redis:6379
  BUCKET_PROVIDER=
  BUCKET_REGION=
  BUCKET_KEY=
  BUCKET_SECRET=
  BUCKET_HAS_FINE_ACL=True
  FILE_UPLOAD_BUCKET=care-data
  FILE_UPLOAD_BUCKET_ENDPOINT=
  FACILITY_S3_BUCKET=care-data
  FACILITY_S3_BUCKET_ENDPOINT=
  HCX_AUTH_BASE_PATH=
  HCX_ENCRYPTION_PRIVATE_KEY_URL=
  HCX_IG_URL=
  HCX_PARTICIPANT_CODE=
  HCX_PASSWORD=
  HCX_PROTOCOL_BASE_PATH=
  HCX_USERNAME=
  HCX_CERT_URL=
  JWKS_BASE64=
  ADDITIONAL_PLUGS=[{"name": "example_plugin", "package_name": "git+https://github.com/ohcnetwork/channgeme.git", "version": "@v0.0.0"}]
  ```
- Expose the port as 9000.
- Set the run command to `gunicorn config.wsgi:application --workers 2 --bind :9000`.
- Review and create the resource.

#### Adding Domain for care-api
- Once the care-backend app is set up, go to the settings tab and find the domains section.
- Click the edit option to add your domain.
- Select "I'll manage my domain" and enter `care-api.example.com`.
- Copy the provided link and paste it in your DNS dashboard as a CNAME entry.

#### Care Celery Worker
- Use the `Create Resource From Source Code` option to add a new component.
- Set the Service Provider to GitHub.
- Select the repository `care` and branch `production` (similar to the above step).
- Set the resource type to Worker instead of Web Service.
- Set the build command to:
  ```
  python install_plugins.py && python manage.py collectstatic --noinput && python manage.py compilemessages
  ```
- Set the run command to:
  ```
  celery --app=config.celery_app worker --max-tasks-per-child=6 -B --loglevel=info
  ```
- Deploy the app.

#### Care Celery Beat
- Use the `Create Resource From Source Code` option to add a new component.
- Set the Service Provider to GitHub.
- Select the repository `care` and branch `production`.
- Set the resource type to Job instead of Web Service.
- Set the Job Trigger to run after every successful deployment.
- Set the build command to:
  ```
  python install_plugins.py && python manage.py collectstatic --noinput && python manage.py compilemessages
  ```
- Set the run command to:
  ```
  python manage.py migrate && python manage.py load_redis_index
  ```

### Deploy Care FE App
- Navigate to the App Platform option.
- Click `Create App`.
- Select GitHub as the Service Provider.
- Configure repository access by logging into your GitHub account.
- Fork the GitHub repository [care_fe](https://github.com/ohcnetwork/care_fe).
- The default branch of ohcnetwork/care_fe is `develop`; ensure to use the `production` branch for production usage.
- On the next page, delete the Dockerfile-based web service.
- Click the edit option on the remaining web service and change it to a static site.
- Use the default Build Phase steps and set the Build Command to `npm run build`.
- Set `REACT_CARE_API_URL` to `care-api.example.com`.
- Specify App Info such as name and Project.
- Review and create the resource.
- Set the environment variables:
  ```
  REACT_APP_API_URL: <care-api-url> // URL of the care backend, e.g. https://care-api.example.com
  ```
- Set the build command to `npm run build`.
- Set the output directory to **Auto**.
- Set custom pages as `index.html` for Catchall.
- Click the `Deploy` button.

## Secure the Database Cluster

Make sure to restrict the Database access to the created backend app for security. You can do this by:
- Navigating to the Databases section.
- Selecting your Postgres DB.
- Add Care app as a trusted source.

## Setting up the Domain and CORS

1. Setting up the Domain
- Select the `care-fe` app.
- Navigate to the `Settings` tab.
- Click on the `Domains` section edit option.
- Add the domain name and click on the `Add Domain` button.
- Add CNAME records to the DNS dashboard.

2. Setting up CORS for storage bucket
- Navigate to the Spaces Objects Storage tab in the DigitalOcean Console.
- Click on the bucket created for the care app.
- Click on the settings tab.
- Add CORS configuration as below.
  ```json
  [
    {
      "AllowedHeaders": [
        "*"
      ],
      "AllowedMethods": [
        "GET",
        "POST",
        "PUT",
        "DELETE"
      ],
      "AllowedOrigins": [
        "https://example.com"
      ],
      "ExposeHeaders": []
    }
  ]
  ```
