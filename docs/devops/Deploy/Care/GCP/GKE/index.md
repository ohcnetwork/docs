# GKE

This guide provides a step-by-step process for deploying the **Care** application on **Google Cloud Platform (GCP)** and **Google Kubernetes Engine (GKE)**. The deployment involves the following key steps:

### 1. [Setting Up the Infrastructure](./Infra)

This section walks you through the setup of the primary infrastructure components in **GCP**, ensuring all required resources, including **GKE clusters**, are provisioned correctly.

### 2. [Configuring the Deployment Pipeline](./CICD)

This section covers:

- Setting up **Cloud Build** for automated deployments.
- Building frontend images with a customized `react.env`.
- Building backend images with the necessary plugins defined in `plug_config.py`.
- Ensuring proper integration with **GKE** for seamless application deployment.

### 3. [Triggering the Build Process](./Trigger)

This section includes:

- Steps to trigger the build process.
- Pushing images to **Artifact Registry**.
- Applying changes to **Custom Resource Definitions (CRDs)**.
- Updating **GKE Deployments**.
- Setting up **GitHub Actions** to automate build triggers across multiple projects.

By following these steps, you can ensure a seamless deployment of the Care application on **GKE**.
