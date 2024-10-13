# Deploy Care

## Overview
Care can be deployed on any cloud provider or on-premises. The generic requirements for deploying Care are:

1. Compute Resources
 - Kubernetes Cluster (GKE, EKS, AKS, etc.)
 - Virtual Private Server (VPS such as DigitalOcean Droplet, AWS EC2, GCP Compute Engine, etc.)
 - Platform as a Service (PaaS such as DigitalOcean App Platform, Heroku, etc.)
2. Highly Available Postgres Database
 - Managed Database Service (RDS, Cloud SQL, etc.)
 - Percona HAProxy Cluster, Patroni, etc.
 - any other HA Postgres setup
3. S3 Compatible Object Storage Bucket
 - AWS S3, DigitalOcean Spaces, GCP Cloud Storage, etc.
 - MinIO, Ceph, etc.
4. VPC, Security Groups, Firewall Rules, etc.
 - Isoalted Network for internal communication
 - Security Groups for external communication
 - Firewall Rules for network traffic
5. SMTP Server


| Cloud Provider | Deployment Guide | Type of Deployment |
| --------------- | ---------------- | ------------- |
| AWS             | [AWS Deployment Guide](./AWS/) | Docker Setup with EC2 Instance |
| DigitalOcean    | [DigitalOcean Deployment Guide](./digitalOcean/) | Leveraging App Platform |
| GCP             | [GCP Deployment Guide](./GCP/) | Docker Setup with GCP Compute Engine |
