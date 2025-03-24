# GCP

This section covers deployment options for the Care application on Google Cloud Platform.

## Available Deployment Options

### 1. [Google Cloud Storage (GCS)](./GCS/index.md)

Static website hosting with three-step deployment process:

1. Infrastructure Setup
2. Deployment Process
3. Monitoring & Operations

### 2. [Google Kubernetes Engine (GKE)](./GKE/index.md)

Container orchestration with three-step deployment process:

1. Infrastructure Setup
2. CI/CD Configuration
3. Trigger Setup

## Choosing a Deployment Option

Choose based on your requirements:

- **Use GCS if you need:**

  - Static website hosting
  - Global content delivery
  - Simple deployment process
  - Cost-effective solution

- **Use GKE if you need:**
  - Container orchestration
  - Microservices architecture
  - Advanced scaling capabilities
  - Complex deployment scenarios

## Prerequisites

- Google Cloud SDK installed
- GCP project with billing enabled
- Appropriate IAM permissions
- Domain name (if using custom domain)

## Common Configuration

Before deploying, ensure you have:

1. Domain name configured in GCP DNS
2. SSL certificate (managed by GCP)
3. Appropriate IAM permissions
4. Billing enabled on the project

## Deployment Selection Guide

Choose your deployment method based on:

- **GKE**: For containerized applications, microservices, or when you need Kubernetes features
- **GCS**: For static websites, single-page applications (SPAs), or when you need simple, cost-effective hosting

## Cost Considerations

- GKE: Higher cost but more flexible and scalable
- GCS: Lower cost, pay-per-use model, ideal for static content
