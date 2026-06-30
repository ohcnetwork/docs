---
sidebar_position: 5
title: Deploying Care
---

# Deploying Care onto the cluster

With a Kubernetes cluster provisioned (see [Provisioning the cluster](./cluster-setup.md)),
Care and its supporting services are rolled out module by module from the
[deployment-k8](https://github.com/ohcnetwork/deployment-k8) repository. This page describes the
deployer workflow and the order in which modules are applied.

:::info
The exact commands, variable values, and manifests live in the
[deployment-k8](https://github.com/ohcnetwork/deployment-k8) repo and evolve over time. Treat the
commands below as the canonical *shape* of each step; always run them from a checkout of the repo so
you pick up the current modules and values. A few steps are still being automated — the repo carries
`TODO` markers for a database migrations job and the terminology server — so expect to perform those
manually for now.
:::

## The deployer model

Deployments are driven by `deployer.py`, a [Typer](https://typer.tiangolo.com/) CLI in the root of
the repo, with a `Makefile` that proxies the same commands. Both forms are equivalent — use whichever
you prefer.

Per-environment configuration lives under `environments/<env>/`:

| File | Purpose |
| --- | --- |
| `config.json` | Holds `KUBECONFIG_PATH` — the kubeconfig the deployer uses to talk to the cluster. |
| `variables.tfvars` | The OpenTofu variables for that environment. |

Select the active environment, then inspect what the deployer will use:

```bash
# Select the active environment
python deployer.py set-current-env <env>
# or
make set-current-env <env>

# Inspect the current selection and its resolved config
python deployer.py show-current-env
python deployer.py show-defaults
```

`set-current-env` writes the choice to `.current-env.json`, and every subsequent `apply-tofu` /
`apply-k8` command reads `environments/<env>/` from there. You can sanity-check connectivity to the
selected cluster at any time:

```bash
python deployer.py check-k8-cluster
```

## Two operations per module

Each module is applied in up to two phases:

| Operation | What it does |
| --- | --- |
| `apply-tofu <module>` | Provisions infrastructure and Helm releases for the module via OpenTofu (`tofu init` + `tofu apply` against `infra/<module>/`). |
| `apply-k8 <module>` | Applies the Kubernetes manifests generated under `infra/<module>/resources/` with `kubectl apply`. |

Both have a `make` proxy. The two forms for a module are:

```bash
# OpenTofu provisioning
python deployer.py apply-tofu <module>
make apply-tofu-<module>

# Kubernetes manifests
python deployer.py apply-k8 <module>
make apply-k8-<module>
```

:::note
Not every module needs the `apply-k8` phase — some are fully provisioned by `apply-tofu`. Run
`apply-k8 <module>` only where the module ships manifests under `infra/<module>/resources/`
(for example `volumes`, `networking`, and `database`). The deployer will tell you if the resources
directory is missing.
:::

## Module rollout order

Apply the modules in the order below. Several steps require manual configuration in between
(creating secrets, pushing images, creating buckets), so do not batch them blindly.

1. **volumes** — installs Longhorn for volume management. After Longhorn is up, configure nodes and
   storage classes, create the Longhorn S3 backup-target secret, then `apply-k8 volumes`. Wait a
   couple of minutes for Longhorn to detect the volumes before continuing.
2. **networking** — installs the ingress controllers, then routing. **TLS secrets are created per
   namespace** (`care-be`, `care-fe`, `odoo`, `rustfs`, `metabase`) before `apply-k8 networking`:

   ```bash
   kubectl create secret tls lets-encrypt-cert \
     --cert=fullchain.pem --key=privkey.pem -n <namespace>
   ```
3. **registry** — provisions the container registry used to store all application images. **Then
   build and push images** to the registry using the scripts in `build_scripts/` (which has
   `care_be/`, `care_fe/`, `odoo/`, and `snowstorm/` builders).
4. **database** — provisions PostgreSQL via the CloudNativePG operator together with Redis/Valkey.
   Set up WAL archive storage and the required secrets/operator plugins, then `apply-k8 database` to
   create the catalogs, secrets, roles, and databases.
5. **objectstore** — provisions RustFS. **Then create the required buckets**:
   `chunks`, `ruler`, `admin`, `care-facility`, `care-fileupload`.
6. **monitoring** — installs the monitoring stack (Grafana/Loki). Once stable, log in to Grafana and
   add the Loki datasource and any dashboards you need.
7. **care** — deploys the Care backend and frontend.
8. **odoo** — deploys Odoo. Perform addon configuration, then update the Care secrets and re-apply
   the Care config as needed.
9. **opensearch** — installs the OpenSearch controller, then **apply the cluster manifest**:

   ```bash
   kubectl apply -f infra/opensearch/cluster.yaml
   ```
10. **metabase** — deploys Metabase.
11. **snowstorm** — deploys Snowstorm (the terminology server backing).

:::warning
Before deploying `care`, confirm that **all images have been written to the registry** (step 3). The
backend and frontend pods pull from the registry provisioned earlier, and a missing image will leave
pods in `ImagePullBackOff`.
:::

## Image build and push

The `registry` module only provisions the registry — it does not populate it. Building and pushing
images is a separate, explicit step that uses the per-application build scripts under
`build_scripts/`:

```text
build_scripts/
├── care_be/     # Care backend image
├── care_fe/     # Care frontend image
├── odoo/        # Odoo image
└── snowstorm/   # Snowstorm image
```

Run the relevant builders after the `registry` module is up and before deploying the modules that
consume those images (`care`, `odoo`, `snowstorm`).

## Known gaps

The repo is explicit about steps that are not yet fully automated. Until they land, handle them
manually:

- **Database migrations** — a job to run Care migrations and post-deploy cleanups after the `care`
  module is still a `TODO`. Run migrations manually until it is wired up.
- **Terminology server** — the terminology-server configuration section is a `TODO`. The
  `snowstorm` module deploys the service, but end-to-end configuration is still being documented.

## Next steps

Once Care is running, see [Day-2 operations](./operations.md) for backups, monitoring, and
ongoing maintenance.
