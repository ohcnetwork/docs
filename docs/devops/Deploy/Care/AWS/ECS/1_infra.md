# Infrastructure Configuration
## Configuring the Infra

The step is similar to that of the EC2 setup. The main difference is that we will be using the ECS service instead of the EC2 service.

## Configuring the Virtual Private Cloud (VPC)

1. Access the **AWS Console** and locate the **VPC** service.
2. Initiate the creation of a new VPC by selecting the '**VPC and more**' option and name it `care-vpc`. This action will automatically generate a new VPC, along with associated subnets, route tables, and internet gateways.
3. The default settings will be applied automatically, but you can modify these according to your specific requirements.
4. Make sure **Internet Gateway** is attached to the VPC to enable external communication.

## Configuring the Relational Database Service (RDS)

1. From the **AWS Console**, navigate to the **RDS** service.
2. Create a new database instance using the `PostgreSQL` engine.
3. Assign DB cluster identifier as `care-db`
4. Set the Credential management as `Self managed` and provide the master username and password.
5. Set the Availability zone as Per requirement.
6. Configure the database instance size and storage capacity as needed.
7. Use the same VPC and subnet group that was created earlier.
8. Configure the security group to allow inbound traffic on port `5432` from all sources. (This can be restricted to the VPC to enhance security.)
9. Set Public accessibility to `No` to restrict access to the database from the internet.

## Configuring the S3 Bucket

1. Locate the **S3** service in the **AWS Console**.
2. Create two new buckets and assign them the names `facility-data` and `patient-data`.
3. Adjust the permissions settings for each bucket: set `facility-data` to public and `patient-data` to private.
4. Configure the CORS policy for the `facility-data` and `patient-data` buckets to restrict access to specific domains after the deployment of the application.

## Setting Up IAM Roles

1. Navigate to the **IAM** service in the **AWS Console**.
2. Create a User named `gh-action`
3. assign permissions required to run the commands
4. create access keys and secrets for the user and keep it safe.

## Setting Up Load Balancer

1. Access the Load Balancer service in the AWS Console.
2. Create a new load balancer named `care-lb`.
3. Configure the load balancer to use the VPC and subnets created earlier.
4. Configure the security group to allow inbound traffic on the required ports.
5. Set the listener configuration to forward traffic to the target group.

## Setting Up ECS Cluster

1. Access the **ECS** service in the **AWS Console**.
2. Create a new cluster named `care-cluster`.
3. Choose Fargate (Serverless) as the launch type.
4. Create service and task definitions for the backend, celery and redis-stack-server
5. Create a a new service for each task definition and configure the desired number of tasks to run.
6. In the networking tab, select the VPC and subnets created earlier.
7. Configure the security group to allow inbound traffic on the required ports.
8. Make sure the service is linked to the load balancer created earlier.

## Cost Estimate Table

| Resource       | Instance Type | Region      | Monthly Cost (INR) | Cost Estimation Methodology                          |
|----------------|---------------|-------------|--------------------|-----------------------------------------------------|
| ECS Cluster    | Fargate       | ap-south-1  | ~₹4000.00          | Estimated based on Fargate pricing for minimal usage|
| RDS Instance   | db.t2.micro   | ap-south-1  | ~₹1245.00          | Estimated for a single instance with minimal usage  |
| S3 Bucket      | 20 GB Storage | ap-south-1  | ~₹38.00            | Calculated for 20 GB of standard storage            |
| Load Balancer  | ALB           | ap-south-1  | ~₹1500.00          | Estimated based on ALB pricing                      |
| Data Transfer  | 10 GB Outbound| ap-south-1  | ~₹74.00            | Estimated for 10 GB of outbound data transfer       |
| **Total**      |               |             | ~₹6857.00          |                                                     |

NB: Estimated cost for deploying the **Care** application on **AWS** using **ECS** may vary based on the actual usage and traffic patterns.
