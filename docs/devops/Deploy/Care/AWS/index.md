# AWS
## Deploying Care on AWS EC2 using Cloud Console

This is a step-by-step guide to deploying the **Care** application on **AWS** using **EC2** via **Cloud Console**. The deployment process involves the following steps:

  - [**Setting up the Infrastructure**](./EC2/1_Infra.md): This guide walks you through the steps required to set up the main infrastructure components in **AWS**.

  - [**Configuring the Deployment Pipeline**](./EC2/2_CICD.md): This section assists you in setting up the `codebuild` setup necessary for building the frontend images with a customised `react.env` and backend images with the required plugins specified in `plug_config.py`.

  - [**Triggering the Build Process**](./EC2/3_Trigger.md): This guide provides the steps required to trigger the build process, push the images to **ECR**, and deploy the images to the **EC2** instance. It also demonstrates how to set up **GitHub Actions** for triggering the build process across multiple projects.


## Deploying Care on AWS ECS using Cloud Console
This is a step-by-step guide to deploying the **Care** application on **AWS** using **ECS** via **Cloud Console**. The deployment process involves the following steps:

  - [**Configuring the AWS Infrastructure**](./ECS/1_infra.md): This guide walks you through the steps required to set up the main infrastructure components in **AWS**.

  - [**Setting up the GitHub Actions**](./ECS/2_GitHubActions.md): This section assists you in configuring **GitHub Actions** for the deployment process.

  - [**Setting up the Frontend**](./ECS/3_Frontend.md): This section walks you through the steps required to set up the frontend of the **Care** application.
