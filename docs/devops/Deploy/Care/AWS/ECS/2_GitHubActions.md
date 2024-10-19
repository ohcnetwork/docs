# GitHub Actions

## Setting up GitHub actions

The github workflow file triggered on every manual trigger and push to the `develop` branch or tags starting with `v`. It will build the new container image upon the trigger and update the task definition in the ECS cluster.
This ensures that the latest image is deployed to the ECS cluster.


```
yaml
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
      - uses: actions/checkout@v4

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
          flavor: |
            latest=false
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

    name: Deploy to ECS
    runs-on: ubuntu-latest
    environment:
      name: Deployment-ecs
      url: https://careapi.example.com
    steps:
      - name: Checkout
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
          image: ${{env.IMAGE_VALUE}}

      - name: Fill Celery Worker definition
        id: task-def-celery-worker
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: ${{ steps.task-def-celery-cron.outputs.task-definition }}
          container-name: ${{ env.CONTAINER_NAME_WORKER }}
          image: ${{env.IMAGE_VALUE}}

      - name: Deploy Backend Celery
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.task-def-celery-worker.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE_CELERY }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

      - name: Fill Backend Api definition
        id: task-def-api
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: ${{ env.ECS_TASK_DEFINITION_BACKEND }}
          container-name: ${{ env.CONTAINER_NAME_BACKEND }}
          image: ${{env.IMAGE_VALUE}}

      - name: Deploy Backend Api
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.task-def-api.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE_BACKEND }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

### Secrets and Variables Used

#### Secrets
- `AWS_ACCESS_KEY_ID` = AWS Access Key ID for authentication
- `AWS_SECRET_ACCESS_KEY` = AWS Secret Access Key for authentication
- `DOCKER_HUB_USERNAME` = DockerHub username
- `DOCKER_HUB_ACCESS_TOKEN` = DockerHub access token
- `GITHUB_TOKEN` = GitHub token for authentication
- `ADDITIONAL_PLUGS` = Additional plugins specified in json format to include in the build

#### Variables
- `IMAGE_NAME` = Name of the image to be built
- `AWS_DEFAULT_REGION` = AWS region
- `AWS_DEFAULT_OUTPUT` = AWS output format
- `ECS_SERVICE_BACKEND` = ECS service name for the backend service, e.g. `care-backend`
- `ECS_SERVICE_CELERY` = ECS service name for the celery service, e.g. `care-celery`
- `ECS_CLUSTER` = ECS cluster name, e.g. `care-cluster`
- `ECS_TASK_DEFINITION_BACKEND` = specify the task definition inside a json file eg. `./ecs/backend.json` refer to [backend.json](https://github.com/ohcnetwork/care/blob/develop/aws/backend.json)
- `ECS_TASK_DEFINITION_CELERY` = specify the task definition inside a json file eg. `./ecs/celery.json` refer to [celery.json](https://github.com/ohcnetwork/care/blob/develop/aws/celery.json)
- `CONTAINER_NAME_BACKEND` = Name of the container for the backend service, e.g. `care-backend`
- `CONTAINER_NAME_WORKER` = Name of the container for the celery worker service, e.g. `care-worker`
- `CONTAINER_NAME_CRON` = Name of the container for the celery cron service, e.g. `care-cron`
- `IMAGE_TAG` = Tag for the image to be built
- `IMAGE_VALUE` = Value of the image to be built
