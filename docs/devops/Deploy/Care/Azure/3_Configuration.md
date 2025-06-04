# Configuration and Monitoring

This guide covers advanced configuration, monitoring, and troubleshooting for Care deployments on Azure.

## Monitoring Setup

### 1. Azure Monitor Configuration

```bash
# Enable monitoring for container apps
az monitor diagnostic-settings create \
  --name container-app-logs \
  --resource-group [RESOURCE_GROUP] \
  --resource [CONTAINER_APP_NAME] \
  --resource-type Microsoft.App/containerApps \
  --logs '[{"category": "ContainerAppConsoleLogs","enabled": true}]' \
  --workspace [LOG_ANALYTICS_WORKSPACE]
```

Key flag explanations:
- `--name`: Identifier for the diagnostic settings configuration
- `--resource-type`: Specifies the Azure resource type to monitor
- `--logs`: JSON array specifying which log categories to collect
- `--workspace`: Log Analytics workspace where logs will be sent for analysis

```bash
# Set up alerts for high CPU/memory usage
az monitor metrics alert create \
  --name cpu-alert \
  --resource-group [RESOURCE_GROUP] \
  --scopes [CONTAINER_APP_ID] \
  --condition "avg CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

Key flag explanations:
- `--scopes`: Resource ID(s) to monitor
- `--condition`: Alert trigger criteria using metric name and threshold
- `--window-size 5m`: Time window to evaluate the condition (5 minutes)
- `--evaluation-frequency 1m`: How often to check the condition (every minute)

### 2. Key Metrics

| Component       | Metrics to Monitor                     |
| --------------- | -------------------------------------- |
| Container Apps  | CPU usage, Memory usage, Request count |
| PostgreSQL      | Connection count, Storage usage, IOPS  |
| Redis           | Cache hits, Memory usage, Connections  |
| Network         | Latency, Throughput, Error rate        |

## Troubleshooting

### 1. Container App Issues

```bash
# Check container app logs
az containerapp logs show \
  --name [CONTAINER_APP_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --tail 100
```

Key flag explanations:
- `--tail 100`: Shows only the most recent 100 log entries
- Default settings include all container logs from all revisions

```bash
# Check container app status
az containerapp show \
  --name [CONTAINER_APP_NAME] \
  --resource-group [RESOURCE_GROUP]
```

```bash
# Restart container app
az containerapp restart \
  --name [CONTAINER_APP_NAME] \
  --resource-group [RESOURCE_GROUP]
```

### 2. Database Issues

```bash
# Check PostgreSQL server status
az postgres flexible-server show \
  --name [POSTGRES_SERVER_NAME] \
  --resource-group [RESOURCE_GROUP]
```

```bash
# View PostgreSQL logs
az postgres flexible-server logs list \
  --name [POSTGRES_SERVER_NAME] \
  --resource-group [RESOURCE_GROUP]
```

Key flag explanations:
- Lists all available log files for the PostgreSQL server

```bash
# Test database connectivity
psql "host=[POSTGRES_HOST] port=5432 dbname=[DB_NAME] user=[USERNAME] password=[PASSWORD] sslmode=require"
```

Key parameter explanations:
- `sslmode=require`: Forces SSL encryption for the database connection

### 3. Redis Cache Issues

```bash
# Check Redis status
az redis show \
  --name [REDIS_NAME] \
  --resource-group [RESOURCE_GROUP]
```

```bash
# Flush Redis cache
az redis patch \
  --name [REDIS_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --reboot RebootAllNodes
```

Key flag explanations:
- `--reboot RebootAllNodes`: Flushes all cached data by rebooting all nodes in the Redis cluster

## Maintenance Tasks

### Daily

- Monitor container app logs
- Check application error rates
- Review database performance

### Weekly

- Review access logs
- Check scaling metrics
- Update security patches

### Monthly

- Review backup integrity
- Update SSL certificates if needed
- Optimize resource allocation

## Cost Management

```bash
# Get current resource consumption
az monitor metrics list \
  --resource [RESOURCE_ID] \
  --metric "CpuUsage" \
  --interval 1h \
  --output table
```

Key flag explanations:
- `--metric "CpuUsage"`: Specifies which metric to query
- `--interval 1h`: Time granularity of the data points (hourly)
- `--output table`: Formats results as a readable ASCII table

```bash
# View billing data
az consumption usage list \
  --billing-period [YEAR-MONTH] \
  --query "[].{cost:pretaxCost, product:consumedService, resourceGroup:properties.resourceGroup}" \
  --output table
```

Key flag explanations:
- `--billing-period`: Specific month to get billing data for (format: YYYY-MM)
- `--query`: JMESPath query to filter and format the output
- Selected fields: pretaxCost, consumedService, and resourceGroup

```bash
# Configure budget alerts
az consumption budget create \
  --name monthly-budget \
  --amount 100 \
  --time-grain monthly \
  --category cost \
  --start-date $(date +%Y-%m-01) \
  --notification "actual_gt_80_percent"
```

Key flag explanations:
- `--amount 100`: Budget limit in your currency (e.g., $100)
- `--time-grain monthly`: Budget tracking frequency
- `--category cost`: Budget type (actual spending)
- `--start-date $(date +%Y-%m-01)`: First day of current month as start date
- `--notification "actual_gt_80_percent"`: Alert when spending reaches 80% of budget

## Backup Configuration

```bash
# Setup PostgreSQL automated backups
az postgres flexible-server update \
  --name [POSTGRES_SERVER_NAME] \
  --resource-group [RESOURCE_GROUP] \
  --backup-retention 7
```

Key flag explanations:
- `--backup-retention 7`: Keeps automated backups for 7 days

```bash
# Create a backup script for additional files
cat > backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d%H%M)
az storage blob upload-batch \
  --source /path/to/files \
  --destination [BACKUP_CONTAINER] \
  --account-name [STORAGE_ACCOUNT] \
  --destination-path backup-${TIMESTAMP}
EOF
```

Key parameters in script:
- `--source`: Local directory containing files to back up
- `--destination`: Storage container to upload files to
- `--destination-path`: Custom path with timestamp for versioning

```bash
# Configure storage lifecycle management
cat > lifecycle.json << 'EOF'
{
  "rules": [
    {
      "name": "backupRetention",
      "enabled": true,
      "type": "Lifecycle",
      "definition": {
        "filters": {
          "prefixMatch": ["backup-"],
          "blobTypes": ["blockBlob"]
        },
        "actions": {
          "baseBlob": {
            "delete": {
              "daysAfterModificationGreaterThan": 30
            }
          }
        }
      }
    }
  ]
}
EOF

az storage account management-policy create \
  --account-name [STORAGE_ACCOUNT] \
  --policy @lifecycle.json \
  --resource-group [RESOURCE_GROUP]
```

Key components in lifecycle policy:
- `"name": "backupRetention"`: Identifier for this lifecycle rule
- `"prefixMatch": ["backup-"]`: Applies only to files starting with "backup-"
- `"daysAfterModificationGreaterThan": 30`: Auto-deletes files older than 30 days
- `--policy @lifecycle.json`: References the local JSON file containing the policy
