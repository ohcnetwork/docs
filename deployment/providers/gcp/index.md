---
sidebar_position: 1
title: Google Cloud
---

# Deploying Care on Google Cloud

Google Cloud Platform offers two distinct paths for deploying Care, depending on what you need to run. You can deploy the full Care application on a managed Kubernetes cluster, or host just the Care frontend as a globally distributed static site. Choose the option that matches your architecture and operational requirements.

## Deployment options

### Google Kubernetes Engine (GKE)

Run the full Care application (backend and frontend) on a managed Kubernetes cluster. Container images are built with Cloud Build and stored in Artifact Registry, then deployed to GKE. This option gives you container orchestration, a microservices-friendly architecture, advanced autoscaling, and the ability to handle complex deployment scenarios.

Choose GKE if you need:

- Container orchestration with Kubernetes features
- A microservices architecture
- Advanced scaling capabilities
- Support for complex deployment scenarios

See [Deploy on GKE](./gke.md) for the full walkthrough.

### Google Cloud Storage (GCS)

Host the Care **frontend** as a static website backed by Cloud CDN and a global HTTP(S) load balancer. This gives you fast global content delivery and a simple, cost-effective deployment for static, single-page-application content.

:::note
GCS hosts only the **frontend**. The Care backend must be deployed elsewhere (for example, on GKE or another provider), and the frontend is configured to talk to that backend's API.
:::

Choose GCS if you need:

- Static website hosting
- Global content delivery via Cloud CDN
- A simple deployment process
- A cost-effective, pay-per-use solution

See [Host the frontend on GCS](./gcs.md) for the full walkthrough.

## Choosing between GKE and GCS

| Requirement | GKE | GCS |
| --- | --- | --- |
| Best for | Containerized applications, microservices, full backend + frontend | Static websites, single-page applications (SPAs), frontend-only hosting |
| Orchestration | Kubernetes (container orchestration) | None (static object hosting) |
| Scaling | Advanced, cluster-based autoscaling | Automatic via Cloud CDN edge caching |
| Deployment complexity | Higher — supports complex scenarios | Lower — simple, static deployment |
| Hosts | Full Care application | Frontend only (backend lives elsewhere) |

## Cost considerations

- **GKE**: Higher cost, but more flexible and scalable. Suited to running the complete application with full Kubernetes capabilities.
- **GCS**: Lower cost, pay-per-use model. Ideal for serving static frontend content efficiently.

## Prerequisites

Before deploying with either option, make sure you have:

- The Google Cloud SDK (`gcloud`) installed
- A GCP project with billing enabled
- Appropriate IAM permissions
- A domain name (if using a custom domain)

## Common configuration

Before deploying, ensure the following are in place:

1. Domain name configured in GCP DNS
2. SSL certificate (managed by GCP)
3. Appropriate IAM permissions
4. Billing enabled on the project
