# Deployment Process

This guide covers the deployment process for static websites using Google Cloud Storage.

## Pre-deployment Steps

### 1. Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/ohcnetwork/care_fe.git
cd care_fe

# Install dependencies
npm install

# Run first-time setup to generate pluginMap and install plugin configurations
npm run setup

# Build the application for production
npm run build
```

## Deployment Steps

### 1. Upload Build Files

```bash
# Upload all build files
gsutil -m cp -r build/* gs://[BUCKET_NAME]/
```

### 2. Cache Control Configuration

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

## Cache Strategy

| Content Type | Cache Duration | Cache-Control Header                  |
| ------------ | -------------- | ------------------------------------- |
| Dynamic      | No cache       | `no-cache, no-store, must-revalidate` |
| HTML         | 1 hour         | `public, max-age=3600`                |
| Manifests    | 1 day          | `public, max-age=86400`               |
| Static       | 1 year         | `public, max-age=31536000`            |

## Rollback Process

```bash
# 1. List available versions
gsutil ls -a gs://[BUCKET_NAME]

# 2. Restore specific version
gsutil cp -r gs://[BUCKET_NAME]@[TIMESTAMP]/* gs://[BUCKET_NAME]/

# 3. Invalidate CDN cache
gcloud compute url-maps invalidate-cdn-cache [URL_MAP_NAME] \
  --path "/*"
```

## Post-Deployment Verification

```bash
# Check website accessibility
curl -I https://[DOMAIN_NAME]

# Verify cache headers
curl -I https://[DOMAIN_NAME]/index.html
curl -I https://[DOMAIN_NAME]/static/js/main.js

# Check CDN status
gcloud compute backend-buckets describe [BACKEND_BUCKET_NAME]
```
