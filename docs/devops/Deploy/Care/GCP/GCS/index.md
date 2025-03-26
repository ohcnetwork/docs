# GCS

This guide covers deploying static websites using Google Cloud Storage with CDN and load balancing capabilities.

## Documentation Structure

1. [Infrastructure Setup](./1_Infra.md)

   - GCS and CDN setup
   - Load balancer configuration
   - SSL/TLS and DNS setup

2. [Deployment Process](./2_Deployment.md)

   - Build and upload process
   - Cache control configuration
   - Rollback procedures

3. [Monitoring & Operations](./3_Monitoring.md)

   - Performance monitoring
   - Troubleshooting
   - Cost management

## Architecture Components

- Google Cloud Storage: Static file hosting
- Cloud CDN: Global content delivery
- Global Load Balancer: Traffic management
- Managed SSL/TLS: Secure HTTPS
- Cloud DNS: Domain management

## Prerequisites

1. GCP Project with billing enabled
2. Domain name in Cloud DNS
3. Google Cloud SDK installed
4. Required IAM permissions
