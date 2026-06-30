---
sidebar_position: 1
slug: /
title: Deploying Care
---

# Deploying Care

Care is self-hostable. You can run your own instance end to end, from the
database and object store to the backend workers and the web frontend.

This section is written for **operators and SREs** standing up and running their
own Care instance — people comfortable on the command line and with a cloud
console. It is not an end-user or clinician guide.

## Two ways to deploy

There are two complementary paths through this section. Pick the one that
matches how you want to run Care.

| Path | Best when | What you get |
| --- | --- | --- |
| **[Cloud provider guides](./providers/index.md)** | You are deploying onto one cloud and want a concrete, click-through recipe using that provider's managed services. | Step-by-step guides for [AWS](./providers/aws/index.md) (ECS), [Google Cloud](./providers/gcp/index.md) (GKE, GCS), and [DigitalOcean](./providers/digitalocean.mdx) — managed Postgres, object storage, an image registry, and a CI/CD pipeline. |
| **[Kubernetes reference deployment](./kubernetes/architecture.md)** | You want a provider-agnostic, self-managed production setup, or you run your own hardware. | The OHC reference architecture: a kubeadm cluster managed as infrastructure-as-code ([OpenTofu](https://opentofu.org) + [Helm](https://helm.sh)) from the [deployment-k8](https://github.com/ohcnetwork/deployment-k8) repository. |

The two are not mutually exclusive — the provider guides show how Care maps onto
a single cloud's managed services, while the Kubernetes reference is the
portable, fuller-featured production setup that OHC runs itself.

## What gets deployed

However you deploy it, a Care instance brings up the Care **backend** (web
workers, Celery workers, and a scheduler), the Care **frontend** served as
static assets, and the infrastructure they depend on: **PostgreSQL**, **Redis**,
an **S3-compatible object store**, and — for a full production setup —
**OpenSearch/Elasticsearch**, ingress with TLS termination, an image registry,
and monitoring. The platform components **Odoo** and **Metabase** are commonly
deployed alongside Care.

The cloud guides provision these from each provider's managed services; the
Kubernetes reference runs them in-cluster from Helm charts.

## What this section covers

### Cloud provider guides

- **[Overview & infrastructure requirements](./providers/index.md)** — the
  components a production deployment needs, and how to choose a provider.
- **[AWS](./providers/aws/index.md)** — deploy on ECS Fargate with a GitHub
  Actions pipeline.
- **[Google Cloud](./providers/gcp/index.md)** — deploy on GKE with Cloud Build,
  or host the frontend as a static site on GCS with Cloud CDN.
- **[DigitalOcean](./providers/digitalocean.mdx)** — deploy on the App Platform
  with managed Postgres and Spaces.

### Kubernetes reference deployment

- **[Requirements](./kubernetes/requirements.md)** — workload components, storage
  and backup expectations, and the tooling you need on your workstation.
- **[Reference architecture](./kubernetes/architecture.md)** — the shape of the
  reference cluster: nodes, networking, ingress, storage, and supporting services.
- **[Provisioning the cluster](./kubernetes/cluster-setup.md)** — bringing up the
  Kubernetes cluster with kubeadm, the CNI, and storage.
- **[Deploying Care](./kubernetes/deploying-care.md)** — applying the application
  modules with the `deployer.py` workflow.
- **[Day-2 operations](./kubernetes/operations.md)** — backups, restores,
  monitoring, and routine maintenance.

:::tip Looking to contribute instead?
If you want to run Care locally to develop against it rather than operate a
production instance, see the [Contributor's Guide](/contributing/).
:::
