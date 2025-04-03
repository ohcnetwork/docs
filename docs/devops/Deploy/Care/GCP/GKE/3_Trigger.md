# Build Process

## Getting Ready For First Deployment

### Set the Default GKE Cluster

```bash
# Get the name using:
kubectl config get-contexts

# Set the config:
kubectl config use-context <name>
```

### Run the Helm Script

```bash
bash helm/scripts.sh
```

### Apply Kubernetes Configurations

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

Once ingress is created, `kubectl get ingress care-ingress` will show the IP of the TCP load balancer.
Once the DNS records are added, the SSL will be automatically handled.

## Add DNS Records

Create DNS A records for each domain pointing to the static IP created from "Reserve a static IP address" step.

## Applying Release Updates on GCP Manually

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

## Setting Up Automated GitHub Workflow Triggers

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

## Applying Release Updates

To apply release updates, follow these steps:

1. Retrieve the latest commit hash from the [Care Commit History](https://github.com/ohcnetwork/care/commits/production) and [Care FE Commit History](https://github.com/ohcnetwork/care_fe/commits/production).
2. Go to the deploy repository where the GitHub Action mentioned above is set up.
3. Click on the `Actions` tab.
4. Choose the `Deploy Multiple Projects` workflow.
5. Click on the `Run Workflow` button.
6. Input the latest commit hash for both the backend and frontend.
7. Click on the `Run Workflow` button again.

These steps will initiate the build pipeline for the backend and frontend projects across all the projects set up in the GitHub Secrets.
