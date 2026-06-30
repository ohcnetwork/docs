---
sidebar_position: 1
title: AWS
---

# Deploying Care on AWS

Care runs on AWS as containers on **ECS Fargate**, backed by **Amazon RDS** for the PostgreSQL database, **Amazon S3** for object storage, and an **Application Load Balancer (ALB)** in front. Images are built and the service is deployed through **GitHub Actions**, giving you a fully managed, serverless container runtime with no instances to patch or scale by hand.

See [Deploy on AWS ECS (Fargate)](./ecs.md) for the full walkthrough — VPC and RDS setup, S3 buckets, IAM, the load balancer and ECS cluster, the GitHub Actions pipeline, and frontend hosting.

:::tip
ECS Fargate is the recommended way to run Care on AWS. For a provider-agnostic, self-managed setup, see the [Kubernetes reference deployment](../../kubernetes/architecture.md) instead.
:::
