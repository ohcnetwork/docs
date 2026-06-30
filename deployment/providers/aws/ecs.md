---
sidebar_position: 2
title: AWS ECS
---

# Deploying Care on AWS ECS

This guide walks through deploying Care on AWS using **Elastic Container Service (ECS)** with the **Fargate** serverless launch type. ECS runs the backend, Celery, and Redis containers as serverless tasks, so there are no EC2 instances to provision or manage yourself.

For an overview of the AWS deployment, see the [AWS overview](./index.md).

## Infrastructure

Provision the supporting AWS infrastructure first, then create the ECS cluster and services that run the application containers.

### Configuring the Virtual Private Cloud (VPC)

1. Access the **AWS Console** and locate the **VPC** service.
2. Initiate the creation of a new VPC by selecting the **VPC and more** option and name it `care-vpc`. This action will automatically generate a new VPC, along with associated subnets, route tables, and internet gateways.
3. The default settings will be applied automatically, but you can modify these according to your specific requirements.
4. Ensure that the **Internet Gateway** is attached to the VPC to enable external communication.

### Configuring the Relational Database Service (RDS)

1. From the **AWS Console**, navigate to the **RDS** service.
2. Create a new database instance using the `PostgreSQL` engine.
3. Assign the **DB cluster identifier** as `care-db`.
4. Set the **Credential management** as `Self managed` and provide the master username and password.
5. Set the **Availability Zone** as per requirement.
6. Configure the database instance size and storage capacity as needed.
7. Use the same **VPC** and **subnet group** that was created earlier.
8. Configure the **security group** to allow inbound traffic on port `5432` from all sources. *(This can be restricted to the VPC to enhance security.)*
9. Set **Public accessibility** to `No` to restrict access to the database from the internet.

### Configuring the S3 Bucket

1. Locate the **S3** service in the **AWS Console**.
2. Create two new buckets named `facility-data` and `patient-data`.
3. Adjust the **permissions** settings for each bucket:
   - Set `facility-data` to **public**.
   - Set `patient-data` to **private**.
4. Configure the **CORS policy** for both buckets to restrict access to specific domains after deployment.

### Setting Up IAM Roles

1. Navigate to the **IAM** service in the **AWS Console**.
2. Create a user named `gh-action`.
3. Assign the necessary permissions required to run the deployment commands.
4. Generate access keys and secrets for the user and store them securely.

:::tip
The `gh-action` user's access key and secret are used by the GitHub Actions pipeline as the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets. Store them securely and grant only the permissions required for the deployment.
:::

### Setting Up the Load Balancer

1. Access the **Load Balancer** service in the **AWS Console**.
2. Create a new load balancer named `care-lb`.
3. Configure the load balancer to use the **VPC** and **subnets** created earlier.
4. Configure the **security group** to allow inbound traffic on the required ports.
5. Set up the **listener configuration** to forward traffic to the **target group**.

### Setting Up the ECS Cluster

1. Access the **ECS** service in the **AWS Console**.
2. Create a new cluster named `care-cluster`.
3. Choose **Fargate (Serverless)** as the launch type.
4. Create **service and task definitions** for the backend, Celery, and Redis Stack Server.
5. Create a new **service** for each task definition and configure the desired number of tasks to run.
6. In the **Networking** tab, select the **VPC** and **subnets** created earlier.
7. Configure the **security group** to allow inbound traffic on the required ports.
8. Ensure that the service is linked to the **load balancer** created earlier.

### Cost Estimate Table

| Resource       | Instance Type | Region      | Monthly Cost (INR) | Cost Estimation Methodology                          |
|----------------|---------------|-------------|--------------------|------------------------------------------------------|
| ECS Cluster    | Fargate       | ap-south-1  | ~₹4000.00          | Estimated based on Fargate pricing for minimal usage |
| RDS Instance   | db.t2.micro   | ap-south-1  | ~₹1245.00          | Estimated for a single instance with minimal usage   |
| S3 Bucket      | 20 GB Storage | ap-south-1  | ~₹38.00            | Calculated for 20 GB of standard storage             |
| Load Balancer  | ALB           | ap-south-1  | ~₹1500.00          | Estimated based on ALB pricing                       |
| Data Transfer  | 10 GB Outbound| ap-south-1  | ~₹74.00            | Estimated for 10 GB of outbound data transfer        |
| **Total**      |               |             | ~₹6857.00          |                                                      |

:::note
The estimated cost for deploying the **Care** application on **AWS** using **ECS** may vary based on actual usage and traffic patterns.
:::

## GitHub Actions pipeline

The GitHub workflow file is triggered on every manual trigger, push to the `develop` branch, or tags starting with `v`. It builds the new container image upon the trigger and updates the task definition in the ECS cluster. This ensures that the latest image is deployed to the ECS cluster.

The image is built from `docker/prod.Dockerfile` and pushed to both the GitHub Container Registry (`ghcr.io`) and Docker Hub. The deploy job then renders the task definitions at `./aws/backend.json` and `./aws/celery.json` with the new image and rolls them out to the ECS services.

```yaml
name: Deploy Care

on:
  workflow_dispatch:
  push:
    tags:
      - 'v*'
    branches:
      - develop
    paths-ignore:
      - "docs/**"

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  IMAGE_NAME: care
  AWS_DEFAULT_REGION: ap-south-1
  AWS_DEFAULT_OUTPUT: json
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }} # AWS Access Key ID for authentication
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }} # AWS Secret Access Key for authentication
  ECS_SERVICE_BACKEND: "care-backend" # ECS service name for the backend
  ECS_SERVICE_CELERY: "care-celery" # ECS service name for Celery
  ECS_CLUSTER: "example_cluster" # Name of the ECS cluster
  ECS_TASK_DEFINITION_BACKEND: "./aws/backend.json" # Path to the backend task definition
  ECS_TASK_DEFINITION_CELERY: "./aws/celery.json" # Path to the Celery task definition
  CONTAINER_NAME_BACKEND: "care-backend" # Container name for the backend
  CONTAINER_NAME_WORKER: "care-celery-worker" # Container name for the Celery worker
  CONTAINER_NAME_CRON: "care-celery-beat" # Container name for the Celery beat

jobs:
  build:
    name: Build & Push to container registries
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Generate docker tags
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: |
            ghcr.io/${{ github.repository }}
            ${{ secrets.DOCKER_HUB_USERNAME }}/${{ github.event.repository.name }}
          tags: |
            type=raw,value=production-latest,enable=${{ startsWith(github.event.ref, 'refs/tags/v') }}
            type=raw,value=production-latest-${{ github.run_number }}-{{date 'YYYYMMDD'}}-{{sha}},enable=${{ startsWith(github.event.ref, 'refs/tags/v') }}
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/develop' }}
            type=raw,value=latest-${{ github.run_number }},enable=${{ github.ref == 'refs/heads/develop' }}
            type=semver,pattern={{version}}
          flavor: latest=false

      - name: Setup QEMU
        uses: docker/setup-qemu-action@v3

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }} # DockerHub username
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }} # DockerHub access token

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }} # GitHub token for authentication

      - name: Cache Docker layers
        uses: actions/cache@v4
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-build-${{ hashFiles('Pipfile.lock', 'docker/prod.Dockerfile') }}
          restore-keys: |
            ${{ runner.os }}-buildx-build-

      - name: Build and push image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: docker/prod.Dockerfile
          push: true
          provenance: false
          platforms: linux/amd64,linux/arm64
          tags: ${{ steps.meta.outputs.tags }}
          build-args: |
            APP_VERSION=${{ github.sha }}
            ADDITIONAL_PLUGS=${{ secrets.ADDITIONAL_PLUGS }} # Additional plugins
          cache-from: type=local,src=/tmp/.buildx-cache
          cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max

      - name: Move cache
        run: |
          rm -rf /tmp/.buildx-cache
          mv /tmp/.buildx-cache-new /tmp/.buildx-cache

  deploy:
    name: Deploy to ECS
    runs-on: ubuntu-latest
    environment:
      name: Deployment-ecs
      url: https://careapi.example.com
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }} # AWS Access Key ID for authentication
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }} # AWS Secret Access Key for authentication
          aws-region: ${{ env.AWS_DEFAULT_REGION }}

      - name: IMAGE Tagging
        env:
          ECR_REGISTRY: ghcr.io/${{ github.repository }}
          IMAGE_TAG: latest-${{ github.run_number }}
        run: echo "IMAGE_VALUE=`echo ghcr.io/${{ github.repository }}:$IMAGE_TAG`" >> $GITHUB_ENV

      - name: Fill Celery Cron definition
        id: task-def-celery-cron
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: ${{ env.ECS_TASK_DEFINITION_CELERY }}
          container-name: ${{ env.CONTAINER_NAME_CRON }}
          image: ${{ env.IMAGE_VALUE }}

      - name: Fill Celery Worker definition
        id: task-def-celery-worker
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: ${{ steps.task-def-celery-cron.outputs.task-definition }}
          container-name: ${{ env.CONTAINER_NAME_WORKER }}
          image: ${{ env.IMAGE_VALUE }}

      - name: Deploy Backend Celery
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.task-def-celery-worker.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE_CELERY }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

      - name: Fill Backend API definition
        id: task-def-api
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: ${{ env.ECS_TASK_DEFINITION_BACKEND }}
          container-name: ${{ env.CONTAINER_NAME_BACKEND }}
          image: ${{ env.IMAGE_VALUE }}

      - name: Deploy Backend API
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.task-def-api.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE_BACKEND }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

### Secrets and Variables Used

#### Secrets

- `AWS_ACCESS_KEY_ID`: AWS Access Key ID for authentication
- `AWS_SECRET_ACCESS_KEY`: AWS Secret Access Key for authentication
- `DOCKER_HUB_USERNAME`: DockerHub username
- `DOCKER_HUB_ACCESS_TOKEN`: DockerHub access token
- `GITHUB_TOKEN`: GitHub token for authentication
- `ADDITIONAL_PLUGS`: Additional plugins specified in JSON format to include in the build

#### Variables

- `IMAGE_NAME`: Name of the image to be built
- `AWS_DEFAULT_REGION`: AWS region
- `AWS_DEFAULT_OUTPUT`: AWS output format
- `ECS_SERVICE_BACKEND`: ECS service name for the backend (`care-backend`)
- `ECS_SERVICE_CELERY`: ECS service name for the Celery service (`care-celery`)
- `ECS_CLUSTER`: ECS cluster name (`care-cluster`)
- `ECS_TASK_DEFINITION_BACKEND`: Path to the backend task definition (`./aws/backend.json`)
- `ECS_TASK_DEFINITION_CELERY`: Path to the Celery task definition (`./aws/celery.json`)
- `CONTAINER_NAME_BACKEND`: Container name for the backend (`care-backend`)
- `CONTAINER_NAME_WORKER`: Container name for the Celery worker (`care-worker`)
- `CONTAINER_NAME_CRON`: Container name for the Celery cron (`care-cron`)
- `IMAGE_TAG`: Tag for the built image
- `IMAGE_VALUE`: Value of the built image

## Frontend

The development deployment for Care relies on ECS for its backend deployment. The API provided by the backend can be used by all development frontends, including localhost and [Care_FE](https://github.com/ohcnetwork/care_fe) deploy previews.

You can use any of the following methods to deploy the frontend for both production and deployment previews:

- **Cloudflare Pages**: A static site hosting service that supports automatic deployments from GitHub repositories. See [Cloudflare Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments) for how to deploy preview builds of the frontend.

- **Netlify**: Another static site hosting service that supports automatic deployments from GitHub repositories. See [Netlify deploy previews](https://docs.netlify.com/site-deploys/deploy-previews) for how to deploy preview builds of the frontend.

- **Vercel**: Another static site hosting service that supports automatic deployments from GitHub repositories. See [Vercel preview deployments](https://vercel.com/docs/concepts/deployments/previews) for how to deploy preview builds of the frontend.
