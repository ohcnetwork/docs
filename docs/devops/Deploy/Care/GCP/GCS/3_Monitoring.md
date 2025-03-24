# Monitoring and Operations

This guide covers monitoring, maintenance, and troubleshooting for GCS-hosted static websites.

## Monitoring Setup

### 1. Cloud Monitoring Configuration

```bash
# Enable monitoring service
gcloud services enable monitoring.googleapis.com

# Create monitoring workspace
gcloud monitoring workspaces create [WORKSPACE_NAME] \
  --display-name="GCS Website Monitoring"
```

### 2. Key Metrics

| Component     | Metrics to Monitor              |
| ------------- | ------------------------------- |
| CDN           | Cache hit ratio, Edge latency   |
| Load Balancer | Request count, Response latency |
| Storage       | Storage usage, Egress costs     |

## Troubleshooting

### 1. SSL/Certificate Issues

```bash
# Check certificate status
gcloud compute ssl-certificates describe [SSL_CERT_NAME]

# Verify domain mapping
gcloud compute target-https-proxies describe [HTTPS_PROXY_NAME]

# Update certificate
gcloud compute ssl-certificates create [SSL_CERT_NAME]-new \
  --domains=[DOMAIN_NAME]
```

### 2. CDN/Cache Issues

```bash
# Check object metadata
gsutil stat gs://[BUCKET_NAME]/path/to/file

# Invalidate specific path
gcloud compute url-maps invalidate-cdn-cache [URL_MAP_NAME] \
  --path "/static/*"

# Invalidate all cache
gcloud compute url-maps invalidate-cdn-cache [URL_MAP_NAME] \
  --path "/*"
```

### 3. Access Issues

```bash
# Check bucket permissions
gsutil iam get gs://[BUCKET_NAME]

# Update permissions
gsutil iam ch allUsers:objectViewer gs://[BUCKET_NAME]

# Test access
curl -I https://[DOMAIN_NAME]
```

## Maintenance Tasks

### Daily

- Monitor error rates
- Check CDN performance
- Review access logs

### Weekly

- Review cost metrics
- Check SSL certificate status
- Analyze traffic patterns

### Monthly

- Review IAM permissions
- Update security policies
- Optimize cache settings

## Cost Management

```bash
# Get current month's cost
gcloud billing accounts list

# View CDN usage
gcloud compute backend-buckets describe [BACKEND_BUCKET_NAME] \
  --format="get(cdnPolicy)"

# Optimize storage class
gsutil rewrite -s STANDARD gs://[BUCKET_NAME]/**
```

## Backup Configuration

```bash
# Create backup script
cat > backup.sh <<EOF
#!/bin/bash
BACKUP_DATE=\$(date +%Y%m%d)
gsutil -m cp -r gs://[BUCKET_NAME] gs://[BACKUP_BUCKET]/\$BACKUP_DATE
gsutil lifecycle set lifecycle.json gs://[BACKUP_BUCKET]
EOF

# Configure retention policy
cat > lifecycle.json <<EOF
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {"age": 30}
    }
  ]
}
EOF
```
