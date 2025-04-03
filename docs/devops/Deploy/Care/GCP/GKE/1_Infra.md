# Infrastructure Setup

## Setting Up the Network and Creating a VPC

### Creating a VPC Network

1. Go to **VPC Network** in **Google Cloud Console**.
2. Click **Create VPC network** and name it `care-vpc`.
3. Configure the following settings:
   - **MTU**: `1460`
   - **IPv6 Range**: Disabled
   - **Subnet Creation Mode**: Custom

### Creating a Subnet

4. Create a new subnet with these details:
   - **Name**: `cluster-snet`
   - **Region**: `asia-south1`
   - **IP Stack Type**: `IPv4 (single-stack)`
   - **IPv4 Range**: `10.0.0.0/16`
   - **Private Google Access**: On
   - **Flow Logs**: Off
5. Set **Dynamic Routing Mode** to `Regional`.
6. Keep the default firewall rules.

### Command-Line Equivalent

To create the VPC and subnet using `gcloud`:

```bash
gcloud compute networks create care-vpc --project=$PROJECT --subnet-mode=custom --mtu=1460 --bgp-routing-mode=regional
gcloud compute networks subnets create cluster-snet --project=$PROJECT --range=10.0.0.0/16 --stack-type=IPV4_ONLY --network=care-vpc --region=asia-south1 --enable-private-ip-google-access
```

### Reserving a Static IP Address

1. Navigate to **VPC Networks > IP Addresses**.
2. Click **RESERVE EXTERNAL STATIC IP ADDRESS**.
3. Configure the following:
   - **Name**: `pip-care`
   - **Network Service Tier**: `Premium`
   - **IP Version**: `IPv4`
   - **Type**: `Regional`
   - **Region**: `asia-south1 (Mumbai)`
   - **Attached to**: None
4. Note down the assigned IP for future use.

Command-line equivalent:

```bash
gcloud compute addresses create pip-care --project=$PROJECT --region=asia-south1
```

---

## Setting Up Databases

### Creating a Cloud SQL Instance

1. Go to **Google Cloud Console** > **Cloud SQL**.
2. Click **Create Instance** and choose `PostgreSQL`.
3. Configure the first database:
   - **Instance ID**: `care-db`
   - **Authentication**: Cloud SQL (set a strong master password)
   - **Database Version**: `PostgreSQL 16`
   - **Cloud SQL Edition**: Enterprise
   - **Region**: `asia-south1` | **Primary Zone**: `asia-south1-a`
   - **Machine Type**: `2 vCPU, 8 GB RAM, 20 GB SSD`
   - **Enable**: Automatic storage increases, backups, point-in-time recovery, deletion protection
   - **Instance IP**: Private (assign to `care-vpc`)
4. Create a database named `care`.
5. Repeat for `metabase-db`, but configure it with:
   - **Machine Type**: `1 vCPU, 3.75 GB RAM`
   - **Database Name**: `metabase`

---

## Configuring Cloud Storage

### Creating Buckets

1. Go to **Cloud Storage** > **Buckets** > **Create**.
2. Configure the first bucket:
   - **Name**: `<prefix>-care-facility`
   - **Location**: `asia-south1 (Mumbai)`, `Standard`
   - **Access Control**: Uniform
   - **Public Access Prevention**: Off
3. Configure the second bucket:
   - **Name**: `<prefix>-care-patient-data`
   - **Public Access Prevention**: On
   - **Retention Policy**: 7 days

### Configuring Service Account

1. Navigate to **Settings > Interoperability**.
2. Create a service account `care-bucket-access` with role `Storage Object Admin`.
3. Generate access keys and note them for later use.

---

## Configuring CORS for Cloud Storage

### Setting CORS Rules

For `<prefix>-care-facility`:

```json
[
  {
    "origin": ["*"],
    "responseHeader": ["Content-Type"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

For `<prefix>-care-patient-data`:

```json
[
  {
    "origin": ["care.example.com"],
    "responseHeader": ["Content-Type"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Command-line equivalent:

```bash
gsutil cors set cors.json gs://<prefix>-care-facility
gsutil cors set cors.json gs://<prefix>-care-patient-data
```

---

## Configuring Google Kubernetes Engine (GKE)

### Creating a GKE Cluster

1. Navigate to **Kubernetes Engine** > **Clusters** > **Create**.
2. Choose **Standard Mode**.
3. Configure cluster settings:
   - **Name**: `care-gke`
   - **Location**: `Zonal`
   - **Zone**: `asia-south1-a`

### Configuring Node Pools

1. Select `default pool` and set nodes to `2`.
2. In **Nodes** section:
   - **Machine Type**: `E2-Series`, `e2-standard-2` (2 vCPU, 8 GB RAM)
3. In **Networking** section:
   - **Network**: `care-vpc`
   - **Subnet**: `cluster-snet`
   - **Access**: Public Cluster
4. Enable **HTTP Load Balancing**.
