# Deployment Process

This guide covers the deployment process for Care components on Azure Container Apps.

## Pre-deployment Steps

### 1. Connection String Configuration

These commands help you build the connection strings needed for your application to connect to the database and cache services.

```bash
# Get PostgreSQL connection details
POSTGRES_HOST="[POSTGRES_SERVER_NAME].postgres.database.azure.com"
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@${POSTGRES_HOST}:5432/[DATABASE_NAME]?sslmode=require"

# Get Redis connection details
REDIS_HOST="[REDIS_NAME].redis.cache.windows.net"
REDIS_PORT="6380"
REDIS_KEY=$(az redis list-keys --name [REDIS_NAME] --resource-group [RESOURCE_GROUP] --query primaryKey -o tsv)
REDIS_URL="rediss://:${REDIS_KEY}@${REDIS_HOST}:${REDIS_PORT}/0"
```

### 2. Environment Variable Preparation

```bash
# Define common environment variables array
COMMON_ENV_VARS=(
  "DJANGO_SETTINGS_MODULE=config.settings.production"  # Specifies which settings file Django should use
  "DISABLE_COLLECTSTATIC=1"                            # Prevents automatic static file collection during deployment
  "DATABASE_URL=$DATABASE_URL"                         # Connection string for PostgreSQL database
  "POSTGRES_USER=$POSTGRES_USER"                       # PostgreSQL username
  "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"               # PostgreSQL password
  "POSTGRES_HOST=$POSTGRES_HOST"                       # PostgreSQL server hostname
  "POSTGRES_PORT=$POSTGRES_PORT"                       # PostgreSQL server port
  "POSTGRES_DB=$POSTGRES_DB"                           # PostgreSQL database name
  "REDIS_URL=$REDIS_URL"                               # Connection string for Redis
  "CELERY_BROKER_URL=$REDIS_URL"                       # Message broker URL for Celery tasks
  "REDIS_AUTH_TOKEN=$REDIS_KEY"                        # Redis authentication token
  "REDIS_HOST=$REDIS_HOST"                             # Redis server hostname
  "REDIS_PORT=$REDIS_PORT"                             # Redis server port
  "REDIS_DATABASE=0"                                   # Redis database number
  "CORS_ALLOWED_ORIGINS=[\"https://care.example.com\"]"  # Domains allowed to make cross-origin requests
  "BUCKET_PROVIDER=aws"                                # Storage provider type (S3-compatible)
  "BUCKET_REGION=$LOCATION"                            # Storage region
  "BUCKET_KEY=$S3_ACCESS_KEY"                          # Storage access key
  "BUCKET_SECRET=$S3_SECRET_KEY"                       # Storage secret key
  "BUCKET_ENDPOINT=$S3_ENDPOINT"                       # Storage endpoint URL
  "BUCKET_HAS_FINE_ACL=True"                           # Enables fine-grained access control for S3 objects
  "FILE_UPLOAD_BUCKET=$STORAGE_CONTAINER_NAME"         # Bucket for file uploads
  "FILE_UPLOAD_BUCKET_ENDPOINT=$S3_ENDPOINT"           # Endpoint for file uploads
  "FACILITY_S3_BUCKET=$STORAGE_CONTAINER_NAME"         # Bucket for facility data
  "FACILITY_S3_BUCKET_ENDPOINT=$S3_ENDPOINT"           # Endpoint for facility data
  "JWKS_BASE64=$JWKS_BASE64"                           # Base64-encoded JSON Web Key Set
)
```

## Deployment Steps

### 1. Main Application Deployment

```bash
# Deploy main app
DOCKER_IMAGE="ghcr.io/ohcnetwork/care:production-latest"

az containerapp create \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --environment [ENV_NAME] \
  --image ${DOCKER_IMAGE} \
  --env-vars "${COMMON_ENV_VARS[@]}" \
  --target-port 9000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --command "./app/start.sh"
```

Key flag explanations:
- `--name`: Unique identifier for the container app
- `--image ${DOCKER_IMAGE}`: Uses the Care application's official container image
- `--target-port 9000`: Internal container port that will be exposed
- `--ingress external`: Makes the app publicly accessible from the internet
- `--min-replicas 1`: Minimum number of container instances to maintain
- `--max-replicas 3`: Maximum number of instances allowed during auto-scaling

### 2. Worker Deployment

```bash
# Deploy worker app
az containerapp create \
  --name [WORKER_APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --environment [ENV_NAME] \
  --image ${DOCKER_IMAGE} \
  --env-vars "${COMMON_ENV_VARS[@]}" \
  --min-replicas 1 \
  --max-replicas 3 \
  --command "./app/celery_worker.sh"
```

Key flag explanations:
- No `--ingress` parameter: Workers don't need external HTTP access
- `--command "./app/celery_worker.sh"`: Runs the worker process instead of web server

### 3. Beat Scheduler Deployment

```bash
# Deploy beat app
az containerapp create \
  --name [BEAT_APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --environment [ENV_NAME] \
  --image ${DOCKER_IMAGE} \
  --env-vars "${COMMON_ENV_VARS[@]}" \
  --min-replicas 1 \
  --max-replicas 1 \
  --command "./app/celery_beat.sh"
```

Key flag explanations:
- `--min-replicas 1` and `--max-replicas 1`: Ensures exactly one scheduler instance to prevent duplicate tasks
- `--command "./app/celery_beat.sh"`: Runs the Celery beat scheduler process

## Custom Domain Configuration

```bash
# Get current Container App domain
APP_URL=$(az containerapp show \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --query properties.configuration.ingress.fqdn -o tsv)

# Add custom domain
az containerapp hostname add \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --hostname [CUSTOM_DOMAIN]

# Generate certificate
az containerapp certificate create \
  --name [CERT_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --hostname [CUSTOM_DOMAIN] \
  --validation-method HTTP
```

Key flag explanations:
- `--query properties.configuration.ingress.fqdn -o tsv`: Extracts just the FQDN value in text format
- `--hostname`: The custom domain name to add
- `--validation-method HTTP`: Uses HTTP validation to verify domain ownership
- `--name [CERT_NAME]`: Certificate resource name in Azure

## Scaling Configuration

| Component        | Min Replicas | Max Replicas | Scale Trigger     |
| ---------------- | ------------ | ------------ | ----------------- |
| Web Application  | 1            | 3            | HTTP traffic      |
| Celery Worker    | 1            | 3            | CPU usage         |
| Celery Beat      | 1            | 1            | Always 1 instance |

```bash
# Configure HTTP scaling rules
az containerapp update \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --scale-rule-name http-scaling \
  --scale-rule-type http \
  --scale-rule-http-concurrency 50

# Configure CPU scaling rules for worker
az containerapp update \
  --name [WORKER_APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --scale-rule-name cpu-scaling \
  --scale-rule-type cpu \
  --scale-rule-cpu-threshold 60
```

Key flag explanations:
- `--scale-rule-name`: Unique identifier for the scaling rule
- `--scale-rule-type http`: Scales based on HTTP request volume
- `--scale-rule-http-concurrency 50`: Target of 50 concurrent requests per instance
- `--scale-rule-type cpu`: Scales based on CPU utilization
- `--scale-rule-cpu-threshold 60`: Triggers scaling when CPU exceeds 60%

## Environment Updates

```bash
# Update image version
az containerapp update \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --image [DOCKER_IMAGE_NEW_TAG]

# Add environment variable
az containerapp update \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --set-env-vars "NEW_ENV_VAR=value"

# Update secret
az containerapp secret set \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --secrets "secretName=secretValue"
```

Key flag explanations:
- `--image`: Updates to a new container image version
- `--set-env-vars`: Adds or updates environment variables
- `--secrets`: Adds or updates secure environment variables

## Rollback Process

```bash
# View revision history
az containerapp revision list \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP]

# Activate previous revision
az containerapp revision activate \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --revision [REVISION_NAME]
```

Key flag explanations:
- `--revision`: Identifier of a previous deployment to activate

## Post-Deployment Verification

```bash
# Check application status
az containerapp show \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP]

# View logs
az containerapp logs show \
  --name [APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --tail 100

# Test endpoint
curl -I https://[APP_NAME].[REGION].azurecontainerapps.io
```

Key flag explanations:
- `--tail 100`: Shows only the last 100 log entries
- `curl -I`: Fetches just the HTTP headers to verify the endpoint is responding
