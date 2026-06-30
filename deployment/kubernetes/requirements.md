---
sidebar_position: 2
title: Requirements
---

# Requirements

This page lists what an operator needs in place before deploying Care. The reference
deployment is a small, self-hosted Kubernetes cluster provisioned with `kubeadm` and
managed as infrastructure-as-code with [OpenTofu](https://opentofu.org/). Everything below
is distilled from the deployment repository ([ohcnetwork/deployment-k8](https://github.com/ohcnetwork/deployment-k8));
none of it requires a managed cloud platform, though the same shapes apply if you adapt them to one.

Read the [reference architecture](./architecture.md) first if you want the bigger picture of
how these pieces fit together.

## Infrastructure

The reference is a **two-node cluster on a shared network** — one primary node and one
secondary (failover) node — with replicated storage between them so the secondary can take
over if the primary fails.

| Requirement | Reference value | Notes |
| --- | --- | --- |
| Nodes | At least 2 Linux hosts | One primary, one secondary/failover. Generalize the hostnames; the repo expects `primary_node_name` and `secondary_node_name` as inputs. |
| Network | Shared L2/L3 network between nodes | Each node also needs a routable IP (`primary_node_ip`, `secondary_node_ip`). |
| Kubernetes | Provisioned with `kubeadm` | The reference pins a specific `kubernetesVersion` in `kubeadm.yaml`; match the deployer's expected version rather than assuming "latest". |
| Pod / service networking | Cilium CNI | Pod and service subnets are set in the cluster config. |
| Storage | Per-node volumes, replicated | The reference separates fast (SSD) and bulk (HDD) data paths, e.g. `primary_ssd_data_path`, `primary_hdd_data_path`, `secondary_ssd_data_path`. Replication across nodes is what gives the failover node a usable copy of the data. |
| Swap | Permitted (not disabled) | The reference kubelet config runs with swap enabled in a limited mode rather than forcing it off. |

:::note
The architecture notes describe storage replication as still evolving (RAID-with-replicas
per volume is the target). Treat cross-node data replication as something you must design
and verify for your environment, not as a turnkey feature.
:::

## Workstation tooling

You drive the deployment from an operator workstation that can reach the cluster's
Kubernetes API. Install the following before you begin:

- [ ] **`kubectl`** — to talk to the cluster.
- [ ] **`kubeadm`** — to bootstrap the control plane and join nodes.
- [ ] **OpenTofu (`tofu`)** — the infrastructure is defined as Tofu modules and applied per stack.
- [ ] **Helm** — several components are installed as Helm charts.
- [ ] **Cilium CLI** — to install and inspect the CNI.
- [ ] **Python 3** — the deployer (`deployer.py`, driven via `make`) is a Python program.
- [ ] **The deployer's Python dependency** — install it into your environment:

```bash
pip install -r requirements.txt
```

This installs [Typer](https://typer.tiangolo.com/) (`typer>=0.9.0`), which the `make`
targets use to wrap Tofu and `kubectl` runs. For example, the repo exposes targets such as
`make apply-tofu-<stack>`, `make apply-k8-<stack>`, and `make check-k8-cluster`.

:::tip
Use a Python virtual environment for the deployer so its dependency does not collide with
other tools on your workstation.
:::

## External dependencies

These services are not part of the cluster bootstrap but the deployment expects them to
exist (or be provisioned alongside it).

| Dependency | Purpose | Reference choice |
| --- | --- | --- |
| Container registry | Hosts the images the cluster pulls, including the locally built Care frontend image | The reference **self-hosts** a registry using [zot](https://zotregistry.dev/). Any OCI-compatible registry works. |
| S3-compatible object storage | Off-site target for backups (Postgres, OpenSearch, object-store syncs) | Any S3-compatible endpoint — for example [MinIO](https://min.io/) or DigitalOcean Spaces. Keep the endpoint and credentials as your own secrets. |
| DNS | Resolves the public and internal hostnames for each service (Care API, Care frontend, object store, Odoo, Metabase, monitoring) | The repo takes both public and local domain names per service as inputs. |
| TLS certificates | HTTPS termination at the ingress | [Let's Encrypt](https://letsencrypt.org/); a pre-fetched wildcard certificate is the intended approach so the ingress can terminate TLS for every subdomain. |

:::warning
Do not copy hardcoded node names, internal domains, object-storage endpoints, or any
credentials out of the deployment repository. Those are one operator's environment. Substitute
your own values — for example `<primary-node>`, `your-domain.example`, `<s3-endpoint>` — and
keep secrets out of version control.
:::

## What gets deployed

The cluster runs Care plus its data stores and a few adjacent applications. Use this table
to size your nodes and storage. "Persistent" means the component needs a persistent volume
that survives pod restarts and is included in backups; "non-persistent" means it can be
recreated from scratch with no data loss.

| Component | Shape | Storage | Backups |
| --- | --- | --- | --- |
| Care backend | Multiple web workers + Celery workers + a Celery scheduler | None (stateless) | N/A |
| Care frontend | Served via nginx; image built locally and pushed to the registry | None (stateless) | N/A |
| PostgreSQL (Care) | Production mode, single primary | Persistent | Daily/configurable, to disk and optionally to S3-compatible storage |
| Redis | Cache/broker, non-persistent mode | None | None |
| OpenSearch | Single node, minimal configuration | Persistent | Daily/configurable, to external media |
| Object store | Self-hosted S3-compatible store for uploads, audit logs, and public data | Persistent | Incremental syncs to external storage |
| Odoo | Web workers + Celery workers (with autoscaling) | Via its database | See Odoo Postgres |
| PostgreSQL (Odoo) | Dedicated instance, same hardening as Care's Postgres | Persistent | Daily/configurable, to external media |
| Metabase | Analytics app (with autoscaling) | Via its database | See Metabase Postgres |
| PostgreSQL (Metabase) | Dedicated instance, same hardening as Care's Postgres | Persistent | Daily/configurable backups of its volume |

Alongside the application components, the cluster also provides:

- [ ] **Load balancing** — in front of the cluster, with separate load balancing for the
  object store and for Metabase where that isolation helps.
- [ ] **WAF / firewall routing** — at the ingress, so traffic is filtered before it reaches
  application pods.
- [ ] **Central logging** — file-based logging to a persistent volume, with the ability to
  pipe logs to external destinations.

:::info
The deployment also targets **auto-restore**: a fresh cluster should be rebuildable from the
backups above. That capability depends on every persistent component having a working,
tested backup. Confirm your backups restore before you rely on them — see
[day-2 operations](./operations.md).
:::

## Before you proceed

You are ready to start [provisioning the cluster](./cluster-setup.md) once you can check
every box:

- [ ] Two (or more) Linux nodes are reachable on a shared network, with their IPs and data paths chosen.
- [ ] Your workstation has `kubectl`, `kubeadm`, `tofu`, `helm`, and the Cilium CLI installed.
- [ ] Python 3 is available and `pip install -r requirements.txt` has succeeded.
- [ ] A container registry is reachable (self-hosted or managed).
- [ ] An S3-compatible bucket and credentials exist for backups.
- [ ] DNS records and a TLS certificate (e.g. a Let's Encrypt wildcard) are ready for your domains.
