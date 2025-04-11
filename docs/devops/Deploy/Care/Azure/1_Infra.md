# Infrastructure Setup

This guide covers the core infrastructure setup for deploying Care on Azure Container Apps.

## Core Infrastructure Setup

### 1. Resource Group Configuration

Resource groups are logical containers for Azure resources that share the same lifecycle, permissions, and policies.

```bash
# Create resource group in specified location
az group create --name [RESOURCE_GROUP] --location [LOCATION]
```

### 2. Database Services

The following commands set up a PostgreSQL flexible server with high performance characteristics suitable for production workloads.

```bash
# Create PostgreSQL flexible server
az postgres flexible-server create \
  --name [POSTGRES_SERVER_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --location [LOCATION] \
  --admin-user [ADMIN_USER] \
  --admin-password [ADMIN_PASSWORD] \
  --database-name [DATABASE_NAME] \
  --sku-name Standard_D4ds_v5 \
  --storage-size 32 \
  --version 16 \
  --tier GeneralPurpose \
  --public-access 0.0.0.0 \
  --yes
```

Key flag explanations:
- `--sku-name Standard_D4ds_v5`: Performance tier for compute resources (4 vCores, memory-optimized)
- `--storage-size 32`: Allocated storage in GB
- `--version 16`: PostgreSQL version to deploy
- `--tier GeneralPurpose`: Service tier determines available features and performance levels
- `--public-access 0.0.0.0`: Allow connections from any IP address (will be restricted by firewall rules)
- `--yes`: Automatic confirmation to proceed without prompting

```bash
# Configure PostgreSQL firewall (allow Azure services)
az postgres flexible-server firewall-rule create \
  --name [POSTGRES_SERVER_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

Key flag explanations:
- `--rule-name AllowAzureServices`: Name for the firewall rule
- `--start-ip-address 0.0.0.0` and `--end-ip-address 0.0.0.0`: Special IP range that allows Azure services to connect

### 3. Redis Cache Setup

Redis provides in-memory data structure storage for caching, session management, and message brokering.

```bash
# Create Redis Cache
az redis create \
  --name [REDIS_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --location [LOCATION] \
  --sku Basic \
  --vm-size C1 \
  --redis-version 6
```

Key flag explanations:
- `--sku Basic`: Service tier (Basic is suitable for development/test workloads)
- `--vm-size C1`: Compute size (C1 = 1GB cache)
- `--redis-version 6`: Redis version to deploy

### 4. Application Gateway with WAF

Application Gateway provides a web application firewall (WAF) to protect your application from common exploits and vulnerabilities.

```bash
# Create Application Gateway with WAF
az network application-gateway create \
  --name [APP_GATEWAY_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --location [LOCATION] \
  --sku WAF_v2 \
  --capacity 2 \
  --gateway-ip-configurations "name=appGatewayIpConfig subnet=[SUBNET_ID]" \
  --frontend-ports "name=appGatewayFrontendPort port=80" \
  --http-settings "name=appGatewayHttpSettings port=80 cookie-based-affinity Disabled" \
  --backend-pool "name=appGatewayBackendPool backend-addresses=[\"[BACKEND_FQDN]\"]" \
  --waf-configuration "enabled=true firewall-mode=Prevention"
```

Key flag explanations:
- `--sku WAF_v2`: Tier/version with Web Application Firewall included
- `--capacity 2`: Number of instances for high availability
- `--gateway-ip-configurations`: Network configuration information
- `--frontend-ports`: Ports where the gateway accepts traffic
- `--http-settings`: Backend connection settings (port, affinity)
- `--backend-pool`: Target servers to route traffic to
- `--waf-configuration`: WAF settings (Prevention mode actively blocks detected threats)

## Cost Estimates

Below is an estimated monthly cost breakdown for the infrastructure components:

| Service | Tier/Size | Estimated Monthly Cost (INR) |
|---------|-----------|------------------------------|
| PostgreSQL Flexible Server | Standard_D4ds_v5 | ~₹XXX |
| Redis Cache | Basic C1 | ~₹XXX |
| Application Gateway | WAF_v2 | ~₹XXX |
| Container Apps | Standard | ~₹XXX |
| Storage | Standard_LRS | ~₹XXX |
| **Total** | | **~₹XXX** |

## Storage Configuration

### 1. S3-Compatible Storage Options

> **Note:** Azure Blob Storage is **not** S3-compatible, and Care's backend requires S3 compatibility. You will need to use one of these alternative storage solutions below.

#### Option A: Google Cloud Storage (GCS)
```bash
# GCS bucket configuration
STORAGE_ENDPOINT="https://storage.googleapis.com"
BUCKET_NAME="[GCS_BUCKET_NAME]"
ACCESS_KEY="[GCS_ACCESS_KEY]"
SECRET_KEY="[GCS_SECRET_KEY]"
```

#### Option B: DigitalOcean Spaces
```bash
# DigitalOcean Spaces configuration
STORAGE_ENDPOINT="https://[REGION].digitaloceanspaces.com"
BUCKET_NAME="[SPACES_NAME]"
ACCESS_KEY="[SPACES_ACCESS_KEY]"
SECRET_KEY="[SPACES_SECRET_KEY]"
```

### 2. Azure Blob Storage (Alternative)

Azure Blob Storage provides scalable object storage for unstructured data like documents, images, and videos.

> **Warning:** Using Azure Blob Storage directly requires code modifications to Care's backend as it's not S3-compatible.

```bash
# Create storage account
az storage account create \
  --name [STORAGE_ACCOUNT_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --location [LOCATION] \
  --kind StorageV2 \
  --sku Standard_LRS \
  --enable-https-traffic-only true
```

```bash
# Create container for files
az storage container create \
  --name [CONTAINER_NAME] \
  --account-name [STORAGE_ACCOUNT_NAME] \
  --public-access container
```

Key flag explanations:
- `--public-access container`: Access level (container = files are publicly readable but not listable)

## Container App Environment

Container App Environment provides a managed Kubernetes-based environment for running containerized applications.

```bash
# Create Container App Environment
az containerapp env create \
  --name [ENV_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --location [LOCATION]
```

```bash
# Optional: Configure logging
az containerapp env update \
  --name [ENV_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --logs-destination log-analytics \
  --logs-workspace-id [WORKSPACE_ID] \
  --logs-workspace-key [WORKSPACE_KEY]
```

Key flag explanations:
- `--logs-destination log-analytics`: Specifies Log Analytics as the logging provider
- `--logs-workspace-id` and `--logs-workspace-key`: Authentication details for the Log Analytics workspace

## Application Monitoring

Application Insights provides application performance monitoring and telemetry collection to help diagnose issues and analyze usage.

```bash
# Configure application insights
az monitor app-insights component create \
  --app [APP_INSIGHTS_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --location [LOCATION] \
  --kind web \
  --application-type web

# Get instrumentation key
APPINSIGHTS_KEY=$(az monitor app-insights component show \
  --app [APP_INSIGHTS_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --query instrumentationKey \
  --output tsv)
```

## Verification

These commands verify that your resources were created successfully and are running properly.

```bash
# Verify PostgreSQL server
az postgres flexible-server show \
  --name [POSTGRES_SERVER_NAME] \
  --resource-group [RESOURCE_GROUP]

# Verify Redis cache
az redis show \
  --name [REDIS_NAME] \
  --resource-group [RESOURCE_GROUP]

# Verify Container App Environment
az containerapp env show \
  --name [ENV_NAME] \
  --resource-group [RESOURCE_GROUP]
```
