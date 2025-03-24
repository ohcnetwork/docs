# Setting Up Build Pipelines

## Setting Up the Artifact Registry

1. Navigate to the **Artifact Registry** in the **Google Cloud Console**.
2. Create private Artifact Registry repositories named `care` and `care_fe`.
3. Ensure that the repositories are **mutable**.
4. Use the **Default Encryption Key** for the repositories.

## Setting Up Cloud Source Repositories

1. Navigate to the **Cloud Source Repositories** service in the **Google Cloud Console**.
2. Create a new repository named `infra-name`.
3. Add the files `build/react.env` and `plug_config.py` to the repository. (The `plug_config.py` file can be used to include plugins for `care`)
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

6. Clone the [infra-template](https://github.com/ohcnetwork/infra_template) repository. This repository contains the necessary YAML files to deploy our applications as Kubernetes workloads. You will need to replace all generic/example values with your production values. Here's a guide on what to change in each folder:
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

## Setting Up the Cloud Build Project

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
      - "-c"
      - |
        echo "be $_BE_TAG" \
        && echo "fe $_FE_TAG" \
        && echo "metabase $_METABASE_TAG"
    entrypoint: bash
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk:slim"
    args:
      - "-c"
      - |
        gcloud source repos clone $_INFRA_REPO infra
        cd infra
        git config user.name "CloudBuild"
        git config user.email example@cloudbuild.gserviceaccount.com
    dir: /workspace
    id: clone-infra
    entrypoint: bash
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk:slim"
    args:
      - "-c"
      - |
        cd infra
        git pull origin main
        ./deploy.sh $_CARE_GKE_ZONE $_CARE_GKE_CLUSTER
    dir: /workspace
    id: deploy-infra
    entrypoint: bash
options:
  logging: CLOUD_LOGGING_ONLY
substitutions:
  _FE_TAG: $(body.substitutions.care_fe_tag)
  _METABASE_TAG: $(body.substitutions.metabase_tag)
  _BE_TAG: $(body.substitutions.care_be_tag)
  _CARE_GKE_ZONE: $(body.substitutions.care_gke_zone)
  _CARE_GKE_CLUSTER: $(body.substitutions.care_gke_cluster)
  _INFRA_REPO: $(body.substitutions.infra_repo)
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
