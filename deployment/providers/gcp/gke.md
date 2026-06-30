---
sidebar_position: 2
title: GKE
---

# Deploying Care on GKE

This guide provides a step-by-step process for deploying the **Care** application on **Google Cloud Platform (GCP)** using **Google Kubernetes Engine (GKE)**. It combines the full infrastructure setup, the Cloud Build pipeline, and the deployment workflow into a single reference.

The deployment involves three phases:

- **Infrastructure** — provision the VPC, static IP, Cloud SQL databases, Cloud Storage buckets, and the GKE cluster.
- **Build pipeline** — set up Artifact Registry, Cloud Source Repositories, the `infra_template` configuration, and Cloud Build.
- **Deploying** — apply the Kubernetes manifests, configure DNS, and trigger releases manually or via GitHub Actions.

:::info
For an overview of the GCP deployment options and infrastructure requirements, see the [Google Cloud overview](./index.md). To host the Care frontend on Cloud Storage instead of GKE, see [Host the frontend on GCS](./gcs.md).
:::

## Infrastructure

### Setting up the network and creating a VPC

#### Creating a VPC network

1. Go to **VPC Network** in **Google Cloud Console**.
2. Click **Create VPC network** and name it `care-vpc`.
3. Configure the following settings:
   - **MTU**: `1460`
   - **IPv6 Range**: Disabled
   - **Subnet Creation Mode**: Custom

#### Creating a subnet

4. Create a new subnet with these details:
   - **Name**: `cluster-snet`
   - **Region**: `asia-south1`
   - **IP Stack Type**: `IPv4 (single-stack)`
   - **IPv4 Range**: `10.0.0.0/16`
   - **Private Google Access**: On
   - **Flow Logs**: Off
5. Set **Dynamic Routing Mode** to `Regional`.
6. Keep the default firewall rules.

#### Command-line equivalent

To create the VPC and subnet using `gcloud`:

```bash
gcloud compute networks create care-vpc --project=$PROJECT --subnet-mode=custom --mtu=1460 --bgp-routing-mode=regional
gcloud compute networks subnets create cluster-snet --project=$PROJECT --range=10.0.0.0/16 --stack-type=IPV4_ONLY --network=care-vpc --region=asia-south1 --enable-private-ip-google-access
```

#### Reserving a static IP address

1. Navigate to **VPC Networks > IP Addresses**.
2. Click **RESERVE EXTERNAL STATIC IP ADDRESS**.
3. Configure the following:
   - **Name**: `pip-care`
   - **Network Service Tier**: `Premium`
   - **IP Version**: `IPv4`
   - **Type**: `Regional`
   - **Region**: `asia-south1 (Mumbai)`
   - **Attached to**: None
4. Note down the assigned IP for future use.

Command-line equivalent:

```bash
gcloud compute addresses create pip-care --project=$PROJECT --region=asia-south1
```

### Setting up databases

#### Creating a Cloud SQL instance

1. Go to **Google Cloud Console** > **Cloud SQL**.
2. Click **Create Instance** and choose `PostgreSQL`.
3. Configure the first database:
   - **Instance ID**: `care-db`
   - **Authentication**: Cloud SQL (set a strong master password)
   - **Database Version**: `PostgreSQL 16`
   - **Cloud SQL Edition**: Enterprise
   - **Region**: `asia-south1` | **Primary Zone**: `asia-south1-a`
   - **Machine Type**: `2 vCPU, 8 GB RAM, 20 GB SSD`
   - **Enable**: Automatic storage increases, backups, point-in-time recovery, deletion protection
   - **Instance IP**: Private (assign to `care-vpc`)
4. Create a database named `care`.
5. Repeat for `metabase-db`, but configure it with:
   - **Machine Type**: `1 vCPU, 3.75 GB RAM`
   - **Database Name**: `metabase`

### Configuring Cloud Storage

#### Creating buckets

1. Go to **Cloud Storage** > **Buckets** > **Create**.
2. Configure the first bucket:
   - **Name**: `<prefix>-care-facility`
   - **Location**: `asia-south1 (Mumbai)`, `Standard`
   - **Access Control**: Uniform
   - **Public Access Prevention**: Off
3. Configure the second bucket:
   - **Name**: `<prefix>-care-patient-data`
   - **Public Access Prevention**: On
   - **Retention Policy**: 7 days

#### Configuring the service account

1. Navigate to **Settings > Interoperability**.
2. Create a service account `care-bucket-access` with role `Storage Object Admin`.
3. Generate access keys and note them for later use.

#### Configuring CORS for Cloud Storage

For `<prefix>-care-facility`:

```json
[
  {
    "origin": ["*"],
    "responseHeader": ["Content-Type"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

For `<prefix>-care-patient-data`:

```json
[
  {
    "origin": ["care.example.com"],
    "responseHeader": ["Content-Type"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Command-line equivalent:

```bash
gsutil cors set cors.json gs://<prefix>-care-facility
gsutil cors set cors.json gs://<prefix>-care-patient-data
```

### Configuring Google Kubernetes Engine (GKE)

#### Creating a GKE cluster

1. Navigate to **Kubernetes Engine** > **Clusters** > **Create**.
2. Choose **Standard Mode**.
3. Configure cluster settings:
   - **Name**: `care-gke`
   - **Location**: `Zonal`
   - **Zone**: `asia-south1-a`

#### Configuring node pools

1. Select `default pool` and set nodes to `2`.
2. In **Nodes** section:
   - **Machine Type**: `E2-Series`, `e2-standard-2` (2 vCPU, 8 GB RAM)
3. In **Networking** section:
   - **Network**: `care-vpc`
   - **Subnet**: `cluster-snet`
   - **Access**: Public Cluster
4. Enable **HTTP Load Balancing**.

## Build pipeline

### Setting up the Artifact Registry

1. Navigate to the **Artifact Registry** in the **Google Cloud Console**.
2. Create private Artifact Registry repositories named `care` and `care_fe`.
3. Ensure that the repositories are **mutable**.
4. Use the **Default Encryption Key** for the repositories.

### Setting up Cloud Source Repositories

1. Navigate to the **Cloud Source Repositories** service in the **Google Cloud Console**.
2. Create a new repository named `infra-name`.
3. Add the files `build/react.env` and `plug_config.py` to the repository. (The `plug_config.py` file can be used to include plugins for `care`.)
4. Add the following content to the `react.env` file:

```yaml
REACT_PLAUSIBLE_SERVER_URL=https://plausible.example.com
REACT_HEADER_LOGO='{"light":"https://cdn.ohc.network/header_logo.png","dark":"https://cdn.ohc.network/header_logo.png"}'
REACT_MAIN_LOGO='{"light":"https://cdn.ohc.network/light-logo.svg","dark":"https://cdn.ohc.network/black-logo.svg"}'
REACT_GMAPS_API_KEY="examplekey"
REACT_GOV_DATA_API_KEY=""
REACT_RECAPTCHA_SITE_KEY=""
REACT_SENTRY_DSN=""
REACT_SAMPLE_FORMAT_ASSET_IMPORT=""
REACT_SAMPLE_FORMAT_EXTERNAL_RESULT_IMPORT=""
REACT_KASP_ENABLED=""
REACT_ENABLE_HCX=""
REACT_ENABLE_ABDM=""
REACT_ENABLE_SCRIBE=""
REACT_WARTIME_SHIFTING=""
REACT_OHCN_URL=""
REACT_PLAUSIBLE_SITE_DOMAIN="care.example.com"
REACT_SENTRY_ENVIRONMENT=""
REACT_CARE_API_URL="https://care.example.com"
REACT_DASHBOARD_URL=""
```

5. Add the following content to the `plug_config.py` file (if required):

```python
from plugs.manager import PlugManager
from plugs.plug import Plug

hcx_plugin = Plug(
    name="hcx",
    package_name="git+https://github.com/ohcnetwork/care_hcx.git",
    version="@main",
    configs={},
)

plugs = [hcx_plugin]

manager = PlugManager(plugs)
```

6. Clone the [infra_template](https://github.com/ohcnetwork/infra_template) repository. This repository contains the necessary YAML files to deploy our applications as Kubernetes workloads. You will need to replace all generic/example values with your production values. Here's a guide on what to change in each folder:
   - **Certificate**: Replace the example hostnames for `dnsNames` with your actual hostnames.
   - **ConfigMaps**:
     - In `care-configmap.yaml`, add your database configurations.
     - Update the hostnames in `CSRF_TRUSTED_ORIGINS` and `DJANGO_ALLOWED_HOSTS`.
     - In `nginx.yaml`, update the `server_name` with your hostnames.
   - **Helm**:
     - Install Helm if you haven't already.
     - Use the static IP created from the **"Reserve a static IP address"** step to replace the IP value in `helm/scripts.sh`.
   - **Ingress**: Replace the example hostnames with your actual hostnames.
   - **Secrets**:
     - Update `care-secrets.yml` with your secrets.
     - Update `metabase.yml` with your Metabase database credentials.
7. Push the changes to the `infra-name` repository created earlier in **Cloud Source Repositories**.

### Setting up the Cloud Build project

1. Navigate to the **Cloud Build** service in the **Google Cloud Console**.
2. Establish a new build project, name it `deploy-care`.
3. Generate a new trigger for the project.
4. Configure the Event to respond to **Webhook events**.
5. Retrieve the **Webhook URL** from the `Show URL Preview` option.
6. Define the Configuration as `Cloud Build configuration file (yaml or json)`.
7. Specify the Location as `Inline` and insert the following content:

```yaml
steps:
  - name: ubuntu
    args:
      - '-c'
      - |
        echo "be $_BE_TAG" \
        && echo "fe $_FE_TAG" \
        && echo "metabase $_METABASE_TAG"
    entrypoint: bash

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk:slim'
    args:
      - '-c'
      - |
        gcloud source repos clone $_INFRA_REPO infra
        cd infra
        git config user.name "CloudBuild"
        git config user.email example@cloudbuild.gserviceaccount.com
    dir: /workspace
    id: clone-infra
    entrypoint: bash

  - name: gcr.io/cloud-builders/gsutil
    args:
      - '-c'
      - |
        if [[ -n "$_BE_TAG" ]]; then
          curl -L https://github.com/ohcnetwork/care/archive/$_BE_TAG.zip -o care.zip
          unzip care.zip
          mv care-$_BE_TAG care
        else
          echo "Skipping..."
        fi
    dir: /workspace
    id: download-care
    entrypoint: bash

  - name: ubuntu
    args:
      - '-c'
      - |
        if [[ -n "$_BE_TAG" ]]; then
          cp -r /workspace/infra/build/. /workspace/care
        else
          echo "Skipping..."
        fi
    id: copy-build-files
    entrypoint: bash

  - name: gcr.io/cloud-builders/docker
    args:
      - '-c'
      - |
        if [[ -n "$_BE_TAG" ]]; then
          DOCKER_BUILDKIT=1 docker build -f ./care/docker/prod.Dockerfile \
            -t asia-south1-docker.pkg.dev/$PROJECT_ID/care/care:$_BE_TAG \
            -t asia-south1-docker.pkg.dev/$PROJECT_ID/care/care:latest \
            ./care
          docker push \
            asia-south1-docker.pkg.dev/$PROJECT_ID/care/care:$_BE_TAG
          docker push \
            asia-south1-docker.pkg.dev/$PROJECT_ID/care/care:latest
        else
          echo "Skipping..."
        fi
    dir: /workspace
    id: build-care
    entrypoint: bash

  - name: gcr.io/cloud-builders/git
    args:
      - '-c'
      - |
        if [[ -n "$_BE_TAG" ]]; then
          cd infra
          sed -i -e 's|\(image: .*care:\).*|\1$_BE_TAG|' deployments/*
          sed -i -e "/name: deployment-version/{n;s/value: .*/value: \"$BUILD_ID\"/;}" deployments/care-backend.yaml
          sed -i -e "/name: deployment-version/{n;s/value: .*/value: \"$BUILD_ID\"/;}" deployments/care-celery-worker.yaml
          sed -i -e "/name: deployment-version/{n;s/value: .*/value: \"$BUILD_ID\"/;}" deployments/care-celery-beat.yaml
          git add .
          git commit -m "update backend crds to $_BE_TAG" || true
        else
          echo "Skipping..."
        fi
    dir: /workspace
    id: update-care-crd
    entrypoint: bash

  - name: gcr.io/cloud-builders/gsutil
    args:
      - '-c'
      - |
        if [[ -n "$_FE_TAG" ]]; then
          curl -L https://github.com/ohcnetwork/care_fe/archive/$_FE_TAG.zip -o /workspace/care_fe.zip
          unzip /workspace/care_fe.zip -d /workspace
          mv /workspace/care_fe-$_FE_TAG /workspace/care_fe
          cp /workspace/infra/build/react.env /workspace/care_fe/.env.local
          cd /workspace/care_fe
        else
          echo "Skipping..."
        fi
    dir: /workspace
    id: download-care-fe
    entrypoint: bash

  - name: ubuntu
    args:
      - '-c'
      - |
        if [[ -n "$_FE_TAG" ]]; then
          cp /workspace/infra/build/react.env /workspace/care_fe/.env.local
        else
          echo "Skipping..."
        fi
    id: copy-fe-build-files
    entrypoint: bash

  - name: gcr.io/cloud-builders/docker
    args:
      - '-c'
      - |
        if [[ -n "$_FE_TAG" ]]; then
          DOCKER_BUILDKIT=1 docker build -f ./care_fe/Dockerfile \
            -t asia-south1-docker.pkg.dev/$PROJECT_ID/care/care_fe:$_FE_TAG \
            -t asia-south1-docker.pkg.dev/$PROJECT_ID/care/care_fe:latest \
            ./care_fe
          docker push \
            asia-south1-docker.pkg.dev/$PROJECT_ID/care/care_fe:$_FE_TAG
          docker push \
            asia-south1-docker.pkg.dev/$PROJECT_ID/care/care_fe:latest
        else
          echo "Skipping..."
        fi
    dir: /workspace
    id: build-care-fe
    entrypoint: bash

  - name: gcr.io/cloud-builders/git
    args:
      - '-c'
      - |
        if [[ -n "$_FE_TAG" ]]; then
          cd infra
          sed -i -e 's|\(image: .*care_fe:\).*|\1$_FE_TAG|' deployments/care-fe.yaml
          sed -i -e "/name: deployment-version/{n;s/value: .*/value: \"$BUILD_ID\"/;}" deployments/care-fe.yaml
          git add .
          git commit -m "update frontend crds to $_FE_TAG" || true
        else
          echo "Skipping..."
        fi
    dir: /workspace
    id: update-care-fe-crd
    entrypoint: bash

  - name: gcr.io/cloud-builders/git
    args:
      - '-c'
      - |
        if [[ -n "$_METABASE_TAG" ]]; then
          cd infra
          sed -i -e 's|\(image: metabase/metabase:\).*|\1$_METABASE_TAG|' deployments/metabase.yaml
          git add .
          git commit -m "update frontend crds" || true
        else
          echo "Skipping..."
        fi
    dir: /workspace
    id: update-metabase-crd
    entrypoint: bash

  - name: gcr.io/cloud-builders/gke-deploy
    args:
      - '-c'
      - |
        gke-deploy apply \
          --location=${_CARE_GKE_ZONE} \
          --cluster=${_CARE_GKE_CLUSTER} \
          --filename=infra/deployments
    dir: /workspace
    id: deploy-to-gke
    entrypoint: bash

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk:slim'
    args:
      - '-c'
      - |
        cd infra
        git pull --rebase
        git push
    dir: /workspace
    id: push-crds
    entrypoint: bash

options:
  logging: CLOUD_LOGGING_ONLY

substitutions:
  _FE_TAG: $(body.substitutions.care_fe_tag)
  _METABASE_TAG: $(body.substitutions.metabase_tag)
  _BE_TAG: $(body.substitutions.care_be_tag)
```

8. Save the file and exit the editor.
9. Configure the **Substitution variables** for the Cloud Build trigger:
   - Navigate to the **Substitution variables** tab.
   - Select the `Add substitution variable` button.
   - Input the following variables:
     - Name: `_FE_TAG`, Value: ``
     - Name: `_METABASE_TAG`, Value: ``
     - Name: `_BE_TAG`, Value: ``
     - Name: `_CARE_GKE_ZONE`, Value: ``
     - Name: `_CARE_GKE_CLUSTER`, Value: ``
     - Name: `_INFRA_REPO`, Value: ``
   - Save your changes.
10. In a separate tab, create a **Service Account** for Cloud Build:
    - Navigate to the **IAM Section**.
    - Name the account `cloudbuilder`.
    - Assign the following roles:
      - Artifact Registry Administrator
      - Cloud Build Service Account
      - Cloud Run Source Developer
      - Cloud Source Repositories Service Agent
      - Kubernetes Engine Admin
      - Logs Bucket Writer
      - Secret Manager Secret Accessor
      - Source Repository Reader
      - Source Repository Writer
11. Assign the Service Account to the **Cloud Build trigger**:
    - Navigate to the **Service account** tab.
    - Choose the `cloudbuilder` service account from the list.
12. Save the trigger by selecting the `Create` button.

## Deploying

### Getting ready for first deployment

#### Set the default GKE cluster

```bash
# Get the name using:
kubectl config get-contexts

# Set the config:
kubectl config use-context <name>
```

#### Run the Helm script

```bash
bash helm/scripts.sh
```

#### Apply Kubernetes configurations

Use `kubectl` to apply all the Kubernetes YAML files in the following order:

```bash
# Deploy ConfigMaps:
kubectl apply -f 'configmaps/*'

# Secrets:
kubectl apply -f 'secrets/*'

# Deployments:
kubectl apply -f 'deployments/*'

# Services:
kubectl apply -f 'services/*'

# ClusterIssuer:
kubectl apply -f ClusterIssuer/cluster-issuer.yaml

# Certificate:
kubectl apply -f certificate/certificate.yml

# Ingress:
kubectl apply -f ingress/care.yaml
```

Once ingress is created, `kubectl get ingress care-ingress` will show the IP of the TCP load balancer. Once the DNS records are added, the SSL will be automatically handled.

### Add DNS records

Create DNS A records for each domain pointing to the static IP created from the "Reserve a static IP address" step.

### Applying release updates on GCP manually

To apply release updates, follow these steps:

1. Fetch the latest commit hash from the [Care Commit History](https://github.com/ohcnetwork/care/commits/production) and [Care FE Commit History](https://github.com/ohcnetwork/care_fe/commits/production).
2. Trigger the Cloud Build using the webhook URL available in the Cloud Build console.
3. Use `curl` or any API platform to initiate the build process:

```bash
curl --request POST \
  --url 'https://cloudbuild.googleapis.com/v1/projects/examplelink' \
  --header 'Content-Type: application/json' \
  --data '{
  "substitutions": {
      "care_be_tag": "",
      "care_fe_tag": "",
      "metabase_tag": ""
  }
}'
```

### Setting up automated GitHub workflow triggers

The manual process of triggering the build process can be automated using GitHub Actions. Follow these steps:

1. Navigate to the deploy repository where the GitHub Actions are to be set up.
2. Add the Webhook URL to the GitHub Secrets.
3. Create a new GitHub Action workflow file in the `.github/workflows` directory.
4. Add the following code snippet to the workflow file:

```yaml
name: Deploy Multiple Projects
on:
  workflow_dispatch:
    inputs:
      BE_TAG:
        description: "Backend release tag"
        required: true
      FE_TAG:
        description: "Frontend release tag"
        required: true
      METABASE_TAG:
        description: "Metabase release tag"
        required: false

jobs:
  trigger-post-requests:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Payload
        run: |
          JSON='{ "substitutions": { "care_be_tag":"'"$BE_TAG"'", "care_fe_tag": "'"$FE_TAG"'", "metabase_tag": "'"$METABASE_TAG"'" } }'
          echo "json=$JSON" >> $GITHUB_ENV
        env:
          BE_TAG: ${{ github.event.inputs.BE_TAG }}
          FE_TAG: ${{ github.event.inputs.FE_TAG }}
          METABASE_TAG: ${{ github.event.inputs.METABASE_TAG }}
      - name: Deploy Project 1
        env:
          SECRET_URL: ${{ secrets.WEBHOOK_P1 }}
        run: |
          curl -X POST -H "Content-Type: application/json" \
          -d "$json" \
          $SECRET_URL

      - name: Deploy Project 2
        env:
          SECRET_URL: ${{ secrets.WEBHOOK_P2 }}
        run: |
          curl -X POST -H "Content-Type: application/json" \
          -d "$json" \
          $SECRET_URL

      - name: Deploy Project 3
        env:
          SECRET_URL: ${{ secrets.WEBHOOK_P3 }}
        run: |
          curl -X POST -H "Content-Type: application/json" \
          -d "$json" \
          $SECRET_URL

      - name: Deploy Project 4
        env:
          SECRET_URL: ${{ secrets.WEBHOOK_P4 }}
        run: |
          curl -X POST -H "Content-Type: application/json" \
          -d "$json" \
          $SECRET_URL

      - name: Deploy Project 5
        env:
          SECRET_URL: ${{ secrets.WEBHOOK_P5 }}
        run: |
          curl -X POST -H "Content-Type: application/json" \
          -d "$json" \
          $SECRET_URL

      - name: Deploy Project 6
        env:
          SECRET_URL: ${{ secrets.WEBHOOK_P6 }}
        run: |
          curl -X POST -H "Content-Type: application/json" \
          -d "$json" \
          $SECRET_URL
```

### Applying release updates

To apply release updates, follow these steps:

1. Retrieve the latest commit hash from the [Care Commit History](https://github.com/ohcnetwork/care/commits/production) and [Care FE Commit History](https://github.com/ohcnetwork/care_fe/commits/production).
2. Go to the deploy repository where the GitHub Action mentioned above is set up.
3. Click on the `Actions` tab.
4. Choose the `Deploy Multiple Projects` workflow.
5. Click on the `Run Workflow` button.
6. Input the latest commit hash for both the backend and frontend.
7. Click on the `Run Workflow` button again.

These steps will initiate the build pipeline for the backend and frontend projects across all the projects set up in the GitHub Secrets.
