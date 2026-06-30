---
sidebar_position: 3
title: GCS (static frontend)
---

# Hosting the Care frontend on GCS

This guide covers hosting the Care static frontend (a built `care_fe`) on Google Cloud Storage (GCS), fronted by Cloud CDN and a global external load balancer with managed SSL/TLS, Cloud DNS, and Cloud Monitoring.

:::info
GCS hosts **only the static frontend** — the compiled output of [`care_fe`](https://github.com/ohcnetwork/care_fe). The Care backend/API is a separate service and must be deployed elsewhere (for example on [GKE](./gke.md) or another provider). Point the frontend's API configuration at wherever that backend is reachable.
:::

## Architecture components

- **Google Cloud Storage** — static file hosting for the built frontend
- **Cloud CDN** — global content delivery and edge caching
- **Global load balancer** — external traffic management
- **Managed SSL/TLS** — secure HTTPS termination
- **Cloud DNS** — domain management

## Prerequisites

1. A GCP project with billing enabled
2. A domain name managed in Cloud DNS
3. The Google Cloud SDK (`gcloud`, `gsutil`) installed and authenticated
4. The required IAM permissions to create buckets, load balancers, certificates, and DNS records

## Infrastructure

### GCS bucket configuration

```bash
# Create bucket in specified region
gsutil mb -l asia-south1 gs://[BUCKET_NAME]

# Set public access permissions
gsutil iam ch allUsers:objectViewer gs://[BUCKET_NAME]

# Enable bucket versioning
gsutil versioning set on gs://[BUCKET_NAME]
```

### CDN and load balancer setup

```bash
# Create backend bucket with CDN
gcloud compute backend-buckets create [BACKEND_BUCKET_NAME] \
  --gcs-bucket-name=[BUCKET_NAME] \
  --enable-cdn

# Configure URL map
gcloud compute url-maps create [URL_MAP_NAME] \
  --default-backend-bucket=[BACKEND_BUCKET_NAME]

# Create HTTP proxy
gcloud compute target-http-proxies create [HTTP_PROXY_NAME] \
  --url-map=[URL_MAP_NAME]

# Reserve global IP
gcloud compute addresses create [IP_ADDRESS_NAME] --global
```

### SSL/TLS and forwarding rules

```bash
# Create SSL certificate
gcloud compute ssl-certificates create [SSL_CERT_NAME] \
  --domains=[DOMAIN_NAME]

# Create HTTPS proxy
gcloud compute target-https-proxies create [HTTPS_PROXY_NAME] \
  --url-map=[URL_MAP_NAME] \
  --ssl-certificates=[SSL_CERT_NAME]

# Create forwarding rules
gcloud compute forwarding-rules create [HTTP_FORWARDING_RULE] \
  --load-balancing-scheme=EXTERNAL \
  --global \
  --address=[IP_ADDRESS_NAME] \
  --target-http-proxy=[HTTP_PROXY_NAME] \
  --ports=80

gcloud compute forwarding-rules create [HTTPS_FORWARDING_RULE] \
  --load-balancing-scheme=EXTERNAL \
  --global \
  --address=[IP_ADDRESS_NAME] \
  --target-https-proxy=[HTTPS_PROXY_NAME] \
  --ports=443
```

### CORS setup

```bash
gsutil cors set '[
  {
    "origin": ["https://[DOMAIN_NAME]"],
    "method": ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"],
    "maxAgeSeconds": 3600
  }
]' gs://[BUCKET_NAME]
```

### Bucket security

```bash
# Set uniform bucket-level access
gsutil bucketiam set bucketpolicyonly:on gs://[BUCKET_NAME]

# Configure bucket encryption
gsutil bucketencryption set on gs://[BUCKET_NAME]
```

### DNS configuration

1. Get the load balancer IP:

```bash
gcloud compute addresses describe [IP_ADDRESS_NAME] --global --format="get(address)"
```

2. Configure DNS records:

- **A record** — point to the load balancer IP
- **AAAA record** — for IPv6 support

### Verification

```bash
# Verify bucket setup
gsutil ls -L gs://[BUCKET_NAME]

# Check SSL certificate
gcloud compute ssl-certificates describe [SSL_CERT_NAME]

# Test load balancer
curl -I https://[DOMAIN_NAME]
```

## Deployment

### Build the frontend

```bash
# Clone the repository
git clone https://github.com/ohcnetwork/care_fe.git
cd care_fe

# Install dependencies (a postinstall script runs automatically to
# install platform deps and generate headers)
npm install

# Build the application for production
npm run build
```

:::note
The `care_fe` `package.json` has no `setup` script. Running `npm install` automatically triggers the `postinstall` script, so no separate setup step is required. The production build is written to the `dist/` directory — that is the directory you upload in the next step.
:::

### Upload build files

```bash
# Upload all build files
gsutil -m cp -r dist/* gs://[BUCKET_NAME]/
```

### Cache-control configuration

```bash
# Dynamic content (no cache)
gsutil -m setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" \
  gs://[BUCKET_NAME]/service-worker.js \
  gs://[BUCKET_NAME]/*.js.map

# HTML files (1 hour cache)
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" \
  gs://[BUCKET_NAME]/index.html \
  gs://[BUCKET_NAME]/robots.txt

# Manifest files (1 day cache)
gsutil -m setmeta -h "Cache-Control:public, max-age=86400" \
  gs://[BUCKET_NAME]/manifest.* \
  gs://[BUCKET_NAME]/favicon.ico

# Static assets (1 year cache)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  gs://[BUCKET_NAME]/static/* \
  gs://[BUCKET_NAME]/assets/* \
  gs://[BUCKET_NAME]/*.{js,css,png,svg,jpg}
```

### Cache strategy

| Content Type | Cache Duration | Cache-Control Header                  |
| ------------ | -------------- | ------------------------------------- |
| Dynamic      | No cache       | `no-cache, no-store, must-revalidate` |
| HTML         | 1 hour         | `public, max-age=3600`                |
| Manifests    | 1 day          | `public, max-age=86400`               |
| Static       | 1 year         | `public, max-age=31536000`            |

### Rollback

```bash
# 1. List available versions
gsutil ls -a gs://[BUCKET_NAME]

# 2. Restore specific version
gsutil cp -r gs://[BUCKET_NAME]@[TIMESTAMP]/* gs://[BUCKET_NAME]/

# 3. Invalidate CDN cache
gcloud compute url-maps invalidate-cdn-cache [URL_MAP_NAME] \
  --path "/*"
```

### Post-deployment verification

```bash
# Check website accessibility
curl -I https://[DOMAIN_NAME]

# Verify cache headers
curl -I https://[DOMAIN_NAME]/index.html
curl -I https://[DOMAIN_NAME]/static/js/main.js

# Check CDN status
gcloud compute backend-buckets describe [BACKEND_BUCKET_NAME]
```

## Monitoring & operations

### Cloud Monitoring configuration

```bash
# Enable monitoring service
gcloud services enable monitoring.googleapis.com

# Create monitoring workspace
gcloud monitoring workspaces create [WORKSPACE_NAME] \
  --display-name="GCS Website Monitoring"
```

### Key metrics

| Component     | Metrics to Monitor              |
| ------------- | ------------------------------- |
| CDN           | Cache hit ratio, Edge latency   |
| Load Balancer | Request count, Response latency |
| Storage       | Storage usage, Egress costs     |

### Troubleshooting

#### SSL/certificate issues

```bash
# Check certificate status
gcloud compute ssl-certificates describe [SSL_CERT_NAME]

# Verify domain mapping
gcloud compute target-https-proxies describe [HTTPS_PROXY_NAME]

# Update certificate
gcloud compute ssl-certificates create [SSL_CERT_NAME]-new \
  --domains=[DOMAIN_NAME]
```

#### CDN/cache issues

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

#### Access issues

```bash
# Check bucket permissions
gsutil iam get gs://[BUCKET_NAME]

# Update permissions
gsutil iam ch allUsers:objectViewer gs://[BUCKET_NAME]

# Test access
curl -I https://[DOMAIN_NAME]
```

### Maintenance cadence

**Daily**

- Monitor error rates
- Check CDN performance
- Review access logs

**Weekly**

- Review cost metrics
- Check SSL certificate status
- Analyze traffic patterns

**Monthly**

- Review IAM permissions
- Update security policies
- Optimize cache settings

### Cost management

```bash
# Get current month's cost
gcloud billing accounts list

# View CDN usage
gcloud compute backend-buckets describe [BACKEND_BUCKET_NAME] \
  --format="get(cdnPolicy)"

# Optimize storage class
gsutil rewrite -s STANDARD gs://[BUCKET_NAME]/**
```

### Backup configuration

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

## Related pages

- [Google Cloud overview](./index.md) — choosing between GKE and GCS
- [Deploy on GKE](./gke.md) — host the Care backend on Kubernetes
