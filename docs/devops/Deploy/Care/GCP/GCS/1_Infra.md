# Infrastructure Setup

This guide covers the core infrastructure setup for deploying static websites using Google Cloud Storage.

## Core Infrastructure Setup

### 1. GCS Bucket Configuration

```bash
# Create bucket in specified region
gsutil mb -l asia-south1 gs://[BUCKET_NAME]

# Set public access permissions
gsutil iam ch allUsers:objectViewer gs://[BUCKET_NAME]

# Enable bucket versioning
gsutil versioning set on gs://[BUCKET_NAME]
```

### 2. CDN and Load Balancer Setup

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

### 3. SSL/TLS Configuration

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

## Security Configuration

### 1. CORS Setup

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

### 2. Bucket Security

```bash
# Set uniform bucket-level access
gsutil bucketiam set bucketpolicyonly:on gs://[BUCKET_NAME]

# Configure bucket encryption
gsutil bucketencryption set on gs://[BUCKET_NAME]
```

## DNS Configuration

1. Get load balancer IP:

```bash
gcloud compute addresses describe [IP_ADDRESS_NAME] --global --format="get(address)"
```

2. Configure DNS records:

- A record: Point to load balancer IP
- AAAA record: For IPv6 support

## Verification

```bash
# Verify bucket setup
gsutil ls -L gs://[BUCKET_NAME]

# Check SSL certificate
gcloud compute ssl-certificates describe [SSL_CERT_NAME]

# Test load balancer
curl -I https://[DOMAIN_NAME]
```
