---
sidebar_position: 4
title: Provisioning the cluster
---

# Provisioning the cluster

This page describes how the Kubernetes cluster that hosts Care is brought up: installing the
container runtime and Kubernetes packages on each node, initializing the control plane with
`kubeadm`, labelling nodes, creating the application namespaces, and installing the cluster-level
add-ons (the Cilium CNI and Longhorn storage). Once the cluster and these foundations are in place,
the application stack is rolled out as described in [Deploying Care onto the cluster](./deploying-care.md).

:::warning
Exact node names, IP addresses, internal DNS names, public domains, TLS certificates, and object-store
endpoints are environment-specific and live in the
[`ohcnetwork/deployment-k8`](https://github.com/ohcnetwork/deployment-k8) repository. The commands
below use neutral placeholders such as `<primary-node>`, `<secondary-node>`, and
`kube-api.internal`. Do not copy real secrets or hostnames out of one environment into another —
substitute the values for the cluster you are building.
:::

## Prerequisites

The reference cluster is two Ubuntu nodes on the same network — one **primary** (control plane) and
one **secondary** failover node — provisioned with `kubeadm`. Each node needs the same base
packages installed before it can join the cluster:

```bash
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
```

## 1. Install the container runtime

Care uses **containerd** as the container runtime, installed from the Docker apt repository. Run the
following on every node.

Add the Docker apt repository and install the runtime packages:

```bash
# Add Docker's official GPG key
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to apt sources
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Enable the systemd cgroup driver in containerd so it matches the kubelet's cgroup management:

```bash
containerd config default > config.toml
sudo mv config.toml /etc/containerd/config.toml
sudo sed -i "s/SystemdCgroup = false/SystemdCgroup = true/g" /etc/containerd/config.toml
sudo systemctl restart containerd
```

Raise the inotify limits. Kubernetes and the workloads that run on it open a large number of file
watches, and the defaults are easily exhausted:

```bash
sudo sysctl fs.inotify.max_user_instances=1280
sudo sysctl fs.inotify.max_user_watches=655360
```

:::tip
The `sysctl` commands above take effect immediately but are not persistent. To survive reboots,
write the same `fs.inotify.*` keys into a file under `/etc/sysctl.d/`.
:::

## 2. Install the Kubernetes packages

Install `kubelet`, `kubeadm`, and `kubectl` from the upstream Kubernetes apt repository. The cluster
is pinned to the **v1.34** package line — keep the repository path and the installed version on the
same line across all nodes.

Add the Kubernetes signing key and apt source:

```bash
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

Install the packages and hold them so they are not upgraded out of band:

```bash
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

:::note
The reference cluster runs **with swap enabled**. The `kubeadm` configuration sets `failSwapOn:
false` and enables the `NodeSwap` feature gate with `LimitedSwap` behaviour, so the kubelet tolerates
swap rather than refusing to start. This is intentional for these nodes — see the
`KubeletConfiguration` block in `kubeadm.yaml`.
:::

## 3. Initialize the control plane

`kubeadm` is driven by the checked-in `kubeadm.yaml`, which defines the control-plane endpoint
(`controlPlaneEndpoint`), the API server certificate SANs, the Kubernetes version, and the pod and
service subnets. On the primary node, initialize the cluster:

```bash
sudo kubeadm init --config kubeadm.yaml
```

When `kubeadm init` finishes it prints a `kubeadm join` command containing the API server address,
token, and CA certificate hash. Run that printed command on each worker/secondary node to join it to
the cluster:

```bash
# Example shape only — use the exact command printed by `kubeadm init`
sudo kubeadm join <control-plane-endpoint>:6443 --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash>
```

:::note
The pod and service CIDRs are defined in `kubeadm.yaml` (`networking.podSubnet` and
`networking.serviceSubnet`). The CNI installed in step 6 must agree with these values, which is why
Cilium is configured with `ipam.mode=kubernetes` — it uses the pod CIDR that `kubeadm` allocated.
:::

## 4. Make the control-plane node schedulable

By default `kubeadm` taints the control-plane node so no application pods land on it. Because the
reference cluster is small and the primary node is expected to run workloads, remove the
control-plane and not-ready taints to make it schedulable. The trailing `-` removes the taint:

```bash
kubectl taint node <primary-node> node-role.kubernetes.io/control-plane:NoSchedule-
kubectl taint node <primary-node> node.kubernetes.io/not-ready:NoSchedule-
```

## 5. Label the nodes

The deployer pins workloads and ingress to specific nodes using labels. Apply role and ingress
labels so scheduling and ingress placement are deterministic. Use `--overwrite=True` to make the
commands idempotent:

```bash
# Ingress placement
kubectl label node <primary-node> ingress=private
kubectl label node <secondary-node> ingress=private

kubectl label node <primary-node> onlyingress=nope --overwrite=True
kubectl label node <secondary-node> onlyingress=nope --overwrite=True

# Node roles
kubectl label node <primary-node> ohn/role=primary --overwrite=True
kubectl label node <secondary-node> ohn/role=secondary --overwrite=True
```

:::note
A cloud-only ingress node (a node labelled `ingress=public` / `onlyingress=yes`) is part of the
intended topology but is commented out in the source today. Treat the public-ingress node as
environment-specific: add it only if your topology includes a dedicated cloud ingress node.
:::

## 6. Create the application namespaces

Create one namespace per application area. The deployer expects these to exist before it applies any
resources:

```bash
kubectl create namespace care-be
kubectl create namespace care-fe
kubectl create namespace odoo
kubectl create namespace metabase
kubectl create namespace rustfs
```

| Namespace  | Holds                                   |
| ---------- | --------------------------------------- |
| `care-be`  | Care backend (API, workers)             |
| `care-fe`  | Care frontend                           |
| `odoo`     | Odoo                                    |
| `metabase` | Metabase analytics                      |
| `rustfs`   | RustFS object store                     |

## 7. Install the Cilium CNI

The cluster has no pod networking until a CNI is installed. Care uses **Cilium**, installed with the
Cilium CLI.

The cluster API host is reached through an internal DNS name rather than a raw IP, so that name must
resolve on every node. Add an entry mapping the API name to the primary node's IP in
`/etc/hosts` on **each** node before installing Cilium:

```text
# /etc/hosts on every node
<primary-node-ip>   kube-api.internal
```

Install the Cilium CLI (architecture-aware) and then install Cilium itself, pointing it at the
internal API name and the pod CIDR allocated by `kubeadm`:

```bash
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=amd64
if [ "$(uname -m)" = "aarch64" ]; then CLI_ARCH=arm64; fi
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}
sha256sum --check cilium-linux-${CLI_ARCH}.tar.gz.sha256sum
sudo tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}

cilium install \
  --set k8sServiceHost=kube-api.internal \
  --set k8sServicePort=6443 \
  --set ipam.mode=kubernetes
```

:::warning
`kube-api.internal` is a placeholder for the cluster's real internal API DNS name, which is defined
in the deployment-k8 repo (and listed among the API server certificate SANs in `kubeadm.yaml`). Use
the actual name for your environment, and make sure the matching `/etc/hosts` entry exists on every
node — Cilium pods will not come up if the API host does not resolve.
:::

## 8. Install Longhorn for storage

Persistent volumes are provided by **Longhorn**, installed through the deployer. The deployer splits
work into a `apply-tofu` phase (provision the underlying resources with OpenTofu) and an `apply-k8`
phase (apply the Kubernetes manifests).

Provision Longhorn:

```bash
python deployer.py apply-tofu volumes
```

Once Longhorn is installed, configure the nodes and storage classes as needed in the Longhorn UI or
manifests. Longhorn can also back up volumes to an S3-compatible target; if you use that, create the
backup-target credentials as a secret in the `longhorn-system` namespace (generalize the endpoint,
region, and keys for your environment):

```bash
kubectl create secret generic <backup-secret-name> -n longhorn-system \
  --from-literal=AWS_ACCESS_KEY_ID=XXX \
  --from-literal=AWS_SECRET_ACCESS_KEY=XXX \
  --from-literal=AWS_ENDPOINTS=<s3-endpoint> \
  --from-literal=AWS_REGION=<s3-region>
```

Then apply the remaining Longhorn Kubernetes resources:

```bash
python deployer.py apply-k8 volumes
```

:::tip
After installing Longhorn, wait a couple of minutes before relying on it. Longhorn needs time to
detect the nodes' disks and build the additional metadata it requires before it can serve volumes
reliably.
:::

## Next steps

At this point you have a running cluster with networking and storage: nodes joined and labelled,
namespaces created, Cilium providing pod networking, and Longhorn providing persistent volumes.
The remaining work — ingress controllers, the image registry, PostgreSQL and Redis/Valkey, the RustFS
object store, monitoring, and the Care backend and frontend themselves — is covered in
[Deploying Care onto the cluster](./deploying-care.md).
