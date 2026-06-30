---
sidebar_position: 3
title: Reference architecture
---

# Reference architecture

This page describes the reference deployment topology for Care: a self-contained,
two-node Kubernetes cluster that runs the Care backend and frontend alongside every
supporting datastore and platform service. It is the architecture implemented by the
[`deployment-k8`](https://github.com/ohcnetwork/deployment-k8) repository, where the
infrastructure is provisioned with OpenTofu/Terraform and Helm.

The design targets on-premise or single-tenant cloud installations: everything — database,
object storage, search, container registry, terminology server, monitoring — lives inside
the cluster, so the deployment has no hard dependency on managed cloud services beyond an
optional S3-compatible target for off-site backups.

:::info
This is a reference design, not a turnkey product. Several pieces are still hardening or
evolving — see [Planned and evolving](#planned-and-evolving) below, and treat the [day-2
operations](./operations.md) page as the operational companion to this one.
:::

## How the repository maps to the architecture

The component inventory below is grounded in three directories of the `deployment-k8`
repository. Reading these is the fastest way to see exactly what gets deployed:

| Directory | What it holds |
| --- | --- |
| `infra/` | OpenTofu/Terraform modules, applied per concern: `networking`, `volumes`, `database`, `objectstore`, `registry`, `opensearch`, `monitoring`, `care`, `odoo`, `metabase`, `snowstorm`. |
| `helm_charts/` | First-party Helm charts maintained in-repo: `care_be`, `care_fe`, `odoo`, `metabase`, `snowstorm`. |
| `helm_values/` | Values overlays for upstream and first-party charts: `care-be`, `care-fe`, `longhorn`, `rustfs`, `postgres-db`, `valkey`, `opensearch-operator`, `opensearch-cluster`, `zot`, `odoo`, `metabase`, `snowstorm`, `nginx`, `prom-stack`, `loki`, `alloy`, `grafana-agent-operator`, `argo`. |

Each `infra/<module>` is applied with the repository's `deployer.py` helper (`apply-tofu`
to run the OpenTofu module, `apply-k8` to apply any generated Kubernetes manifests). See
[Deploying Care onto the cluster](./deploying-care.md) for the exact order.

## Cluster topology

The reference cluster is **two nodes on the same network**, provisioned with `kubeadm`:

- A **primary node** (labelled `ohn/role=primary`) that runs the control plane and hosts
  the stateful, latency-sensitive workloads — PostgreSQL, the RustFS object store, the
  container registry, and search.
- A **secondary / failover node** (labelled `ohn/role=secondary`) that hosts the
  public-facing ingress and the observability stack, and acts as the failover target.

The primary control-plane node is made schedulable (its control-plane taint is removed) so
it can also run application workloads. Node labels drive placement: Helm values pin pods to
the correct node via `nodeSelector` on `ohn/role`. Data is **replicated across both nodes**
at the storage layer (see [Storage](#storage)) so the cluster can tolerate the loss of a
node and be rebuilt from replicated volumes plus off-site backups.

:::note
The cluster is built directly with `kubeadm` against a stable Kubernetes release line
(the install notes target the `v1.34` package channel). The full node-bootstrap procedure
— installing containerd, `kubelet`/`kubeadm`/`kubectl`, joining the worker, removing taints,
and applying node labels — is covered in [Provisioning the cluster](./cluster-setup.md).
:::

## Networking

- **CNI: Cilium.** Pod networking and service routing are handled by Cilium, installed in
  `kubernetes` IPAM mode and pointed at the primary node's API server.
- **Load balancing: NodePort / node external IPs.** Ingress controllers are exposed on the
  nodes rather than via a cloud load balancer. The public ingress binds the secondary
  node's IP via `externalIPs`; other services (for example the registry) are reached on
  fixed NodePorts. MetalLB is the intended direction for cleaner L2/L3 load balancing — see
  [Planned and evolving](#planned-and-evolving).
- **Ingress + WAF.** Two ingress controllers run side by side, split into a **private**
  ingress class (`private-nginx`, for internal/admin surfaces such as Grafana, the object
  store console, Odoo, and Metabase) and a **public** ingress class (`public-nginx`, for
  the Care frontend, Care API, and other internet-facing hosts). The public ingress runs
  with a **web application firewall enabled** — ModSecurity with the OWASP Core Rule Set —
  to filter inbound traffic. The longer-term target is an Apache APISIX-based ingress with
  an integrated WAF/firewall.
- **TLS termination at the ingress.** Certificates terminate at the ingress controller.
  The reference setup uses Let's Encrypt, ideally a **pre-fetched wildcard certificate**
  issued via DNS validation and loaded into each application namespace as a TLS secret
  (`lets-encrypt-cert`). Internal pod-to-pod TLS is on the roadmap, not yet in place.

:::warning
Routing host names, node IPs, and domains are environment-specific and supplied through
Terraform variables (for example `care_public_domain`, `careapi_public_domain`,
`primary_node_ip`, `secondary_node_ip`). Do not hardcode site-specific host names into
shared manifests — keep them in your environment's variable file.
:::

## Storage

- **Block storage: Longhorn.** Replicated block volumes are provisioned by Longhorn, with
  dedicated `StorageClass`es per workload (`longhorn-database`, `longhorn-object`,
  `longhorn-registry`, `longhorn-opensearch`, `longhorn-prom`, `longhorn-loki`,
  `longhorn-grafana-dashboard`). Disks are tagged (`ssd`, `hdd`) so latency-sensitive data
  lands on SSD and bulkier data on HDD, and a Longhorn `BackupTarget` points at an
  S3-compatible bucket for volume snapshots.
- **Object storage: RustFS.** A MinIO-compatible object store (RustFS) provides S3-style
  buckets for Care's file uploads and facility data, plus log/audit storage. It runs in
  standalone mode on the primary node, backed by a Longhorn volume, and is fronted by its
  own ingress for the management console.

The buckets Care and the platform expect (for example `care-facility`, `care-fileupload`,
and the log/ruler buckets used by Loki) are created in RustFS as part of bring-up.

## Components

| Component | Role |
| --- | --- |
| Care backend | Care API. Runs as a web deployment plus Celery workers and a Celery beat scheduler; a one-shot migration job applies database migrations. Pulls its image from the in-cluster registry. |
| Care frontend | Static Care web app served by nginx. |
| PostgreSQL | Primary relational datastore, run by the **CloudNativePG (CNPG) operator** as a managed `Cluster`. Hosts the `care`, `odoo`, and `metabase` databases as managed roles/databases, with WAL archiving and scheduled backups to S3 via the Barman Cloud plugin. |
| Valkey / Redis | In-memory cache and Celery broker for the Care backend. Run non-persistent (no disk, no backups). |
| OpenSearch | Search and indexing tier for Care, run via an operator with a single-node cluster and a dedicated Longhorn volume. |
| RustFS | S3-compatible object store (MinIO-compatible) for uploads, facility files, and logs. |
| Odoo | ERP/back-office integration that Care talks to through the `care_odoo` plugin. |
| Metabase | Analytics and dashboards over the Care database. |
| Snowstorm | SNOMED CT terminology server (with a data-loader step to seed terminology). |
| zot | OCI container registry that holds the Care backend/frontend images built and pushed during deployment. |

:::note
The Care backend is pluggable: integrations such as `care_odoo` are installed as additional
plugs at deploy time rather than baked into the core image. See the contributor guide on
[Care pluggable apps](/contributing/plugins) for how plugs are structured.
:::

## Observability

Monitoring is a self-hosted Grafana stack, installed by the `monitoring` module:

- **Prometheus + Grafana** via the `kube-prometheus-stack` chart, for metrics and
  dashboards. Grafana is exposed on the private ingress.
- **Loki** for log aggregation, with its chunk/ruler storage backed by the in-cluster
  RustFS object store.
- **Alloy** runs as the log shipper: it discovers pods, relabels Kubernetes metadata onto
  log streams, and pushes them to Loki.

Prometheus, Loki, and Grafana persist to Longhorn volumes pinned to the secondary node.

## Request and data flow

The high-level path from a client to a datastore:

```text
                         Clients (browsers, integrations)
                                      |
                                      v
              +-------------------------------------------------+
              |   Ingress controllers (nginx + WAF / OWASP CRS) |
              |   TLS termination (Let's Encrypt wildcard)      |
              |   public-nginx  |  private-nginx                |
              +-------------------------------------------------+
                       |                         |
                       v                         v
              +----------------+        +------------------+
              |   Care FE      |        |   Care BE        |
              |   (nginx)      |  --->  |  web + celery    |
              +----------------+        |  + beat          |
                                        +------------------+
                                               |
            +----------------+----------------+----------------+
            v                v                v                v
     +-------------+  +-------------+  +-------------+  +-------------+
     | PostgreSQL  |  | Valkey/     |  | OpenSearch  |  |  RustFS     |
     | (CNPG)      |  | Redis       |  | (search)    |  | (S3 object  |
     | care DB     |  | cache/broker|  |             |  |  storage)   |
     +-------------+  +-------------+  +-------------+  +-------------+
```

Supporting services — Odoo, Metabase, Snowstorm, the zot registry, and the
Prometheus/Grafana/Loki stack — sit alongside this path. Odoo and Metabase share the same
CNPG-managed PostgreSQL cluster (separate databases), Care reaches Odoo over the internal
service network, and the registry serves the Care images that the backend and frontend
deployments pull.

## Planned and evolving

Several aspects of this architecture are explicitly works in progress. Treat the items
below as roadmap direction drawn from the design's own backlog, not as current guarantees:

- **PostgreSQL fully on a cluster operator.** PostgreSQL is being consolidated onto the
  CloudNativePG operator (moving off hand-written YAML and onto operator-managed clusters)
  for both Care and the supporting databases.
- **Ingress and load balancing.** Migrating toward an APISIX-based ingress with an
  integrated WAF/firewall, and toward MetalLB for load balancing in place of plain
  NodePort/external-IP exposure.
- **Terminology server.** The Snowstorm-based terminology service is still being wired into
  the standard deployment flow.
- **Secrets and automation.** Generating credentials through Terraform and auto-wiring them
  into dependent services, rather than creating secrets by hand.
- **Backups and restore.** Extending snapshots/backups to cover every stateful component
  and documenting a clean restore of a fresh cluster from backups.
- **Inter-pod TLS.** Adding TLS for database and other pod-to-pod communication.
- **Version-locking the charts.** Pinning all Helm chart versions so deployments are fully
  reproducible.

For how these components are stood up in practice, continue to
[Provisioning the cluster](./cluster-setup.md) and
[Deploying Care onto the cluster](./deploying-care.md).
