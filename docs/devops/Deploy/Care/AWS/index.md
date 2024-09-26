# AWS
## Deploying Care on AWS using Cloud Console

This guide will walk you through deploying Care on AWS using the Cloud Console. The setup is split into mutliple categories to make it easier to follow along.

## Setting up the VPC

1. Navigate to the VPC service in the AWS Console.
2. Create a new VPC by choosing the VPC and more option. (This will create a new VPC along with new subnets, route tables, and internet gateways.)
3. Set the default presets and edit fields according to preference.

## Setting up the RDS Database

1. Navigate to the RDS service in the AWS Console.
2. Create a new database instance. name it `care-db`.
3. Select the engine type as `PostgreSQL`.
4. Choose the free tier option.
5. Set the master username and password.
6. Set the VPC to the one created in the previous step.

## Setting up S3 Bucket

1. Navigate to the S3 service in the AWS Console.
2. Create buckets and name it `facility-data` and `patient-data`.
3. Set the permissions to public for facility-data and private for patient-data.

## Setting up the ECR Repository

1. Navigate to the ECR service in the AWS Console.
2. Create new repositories `care` and `care_fe`.
3. Set the permissions private for care and care_fe.

## Setting up SSM Documents

1. Navigate to the SSM service in the AWS Console.
2. Create new document named `trigger-docker`
3. Add the following content to the document:
```yaml
schemaVersion: "2.2"
description: "Trigger Docker Container"
mainSteps:
- action: "aws:runShellScript"
  name: "triggerDocker"
  inputs:
    runCommand:
    - "bash /home/ubuntu/trigger-docker.sh"
```

## Setting up CodeCommit Repository

1. Navigate to the CodeCommit service in the AWS Console.
2. Create a new repository named `infra-name`.
3. Add the files `build/react.env` and `plug_config.py` to the repository. (plug_config.py can be used to include plugins for care)

## Setting up the CodeBuild Project

1. Navigate to the Cloudbuild service in the AWS Console.
2. Create a new build project named `deploy-care`.
3. Add the following build steps:
```yaml
version: 0.2
env:
  variables:
    AWS_DEFAULT_REGION: ap-south-1
    ACCOUNT_ID:  ${ACCOUNT_ID}
    INSTANCE_ID: ${INSTANCE_ID}
    BE_TAG: ${BE_TAG}
    FE_TAG: ${FE_TAG}
    METABASE_TAG: ${METABASE_TAG}
  git-credential-helper: yes

phases:
  install:
    commands:
      - echo "Installing necessary dependencies"
      - yum install -y unzip
      - echo "Environment Variables:"
      - echo "AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}"
      - echo "INSTANCE_ID=${INSTANCE_ID}"
      - echo "BE_TAG=${BE_TAG}"
      - echo "FE_TAG=${FE_TAG}"
      - echo "ACCOUNT_ID=${ACCOUNT_ID}"
      - echo "METABASE_TAG=${METABASE_TAG}"

  pre_build:
    commands:
      - LOGIN_PASSWORD=$(aws ecr get-login-password --region $AWS_DEFAULT_REGION)
      - echo $LOGIN_PASSWORD | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com
      - git clone https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/infra-name infra/
  build:
    commands:
      - echo "Building and pushing Docker images"

      # Build and Push the Backend Image
      - |
        if [[ -n "${BE_TAG}" ]]; then
          curl -L https://github.com/ohcnetwork/care/archive/${BE_TAG}.zip -o care.zip
          unzip care.zip
          mv care-${BE_TAG} care
          cp infra/build/plug_config.py. care/plug_config.py
          cp infra/build/. care
          DOCKER_BUILDKIT=1 docker build -f ./care/docker/prod.Dockerfile \
            -t ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/care:${BE_TAG} \
            -t ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/care:latest ./care
          docker push ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/care:${BE_TAG}
          docker push ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/care:latest
        fi

      # Build and Push the Frontend Image
      - |
        if [[ -n "${FE_TAG}" ]]; then
          curl -L https://github.com/ohcnetwork/care_fe/archive/${FE_TAG}.zip -o care_fe.zip
          unzip care_fe.zip
          mv care_fe-${FE_TAG} care_fe
          cp infra/build/react.env care_fe/.env.local
          DOCKER_BUILDKIT=1 docker build -f ./care_fe/Dockerfile \
            -t ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/care_fe:${FE_TAG} \
            -t ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/care_fe:latest ./care_fe
          docker push ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/care_fe:${FE_TAG}
          docker push ${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/care_fe:latest
        fi

  post_build:
    commands:
      - echo "Writing environment variables to JSON file..."
      - |
        aws ssm send-command \
          --document-name "AWS-RunShellScript" \
          --targets "Key=instanceids,Values=${INSTANCE_ID}" \
          --parameters "{\"commands\":[
            \"echo '{\\\"ACCOUNT_ID\\\": \\\"${ACCOUNT_ID}\\\", \\\"AWS_DEFAULT_REGION\\\": \\\"${AWS_DEFAULT_REGION}\\\", \\\"LOGIN_PASSWORD\\\": \\\"${LOGIN_PASSWORD}\\\"}' > /tmp/env_vars.json\"
          ]}"
      - echo "Environment variables written to /tmp/env_vars.json"
      - aws ssm send-command --document-name "trigger-docker" --targets "Key=instanceids,Values=${INSTANCE_ID}"

```
4. Choose Amazon Linux as the operating system.
5. Enable cloudwatch logs.
6. Use the Default service role and let aws add necessary permissions to the role.
7. Set the environment variables `ACCOUNT_ID`, `INSTANCE_ID`. in the build project settings.

## Setting up the EC2 Instance

1. Navigate to the EC2 service in the AWS Console.
2. Launch a new instance with the ubuntu server.
3. ssh into the terminal and setup docker
4. git clone the care-docker repository.
5. Populate the .env values with the necessary values.
6. Create the file `trigger-docker.sh` with the following content:
```bash
#!/bin/bash

# Define variables
ENV_FILE="/tmp/env_vars.json"
DOCKER_COMPOSE_DIR="/home/ubuntu/care-docker"
LOG_DIR="/var/log/docker-operations"
LOG_FILE="$LOG_DIR/docker-operations.log"
PULL_LOG_FILE="$LOG_DIR/docker-compose-pull.log"
UP_LOG_FILE="$LOG_DIR/docker-compose-up.log"
DOWN_LOG_FILE="$LOG_DIR/docker-compose-down.log"
MAX_LOG_SIZE=10M
BACKUP_COUNT=5

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function for logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to rotate logs
rotate_log() {
    if [ -f "$1" ] && [ $(du -b "$1" | cut -f1) -ge $(numfmt --from=iec $MAX_LOG_SIZE) ]; then
        for i in $(seq $((BACKUP_COUNT-1)) -1 1); do
            [ -f "${1}.$i" ] && mv "${1}.$i" "${1}.$((i+1))"
        done
        mv "$1" "${1}.1"
        touch "$1"
    fi
}

# Rotate logs before starting
rotate_log "$LOG_FILE"
rotate_log "$PULL_LOG_FILE"
rotate_log "$UP_LOG_FILE"

# Read environment variables
if [ ! -f "$ENV_FILE" ]; then
    log "Error: Environment file $ENV_FILE not found"
    exit 1
fi

eval $(cat "$ENV_FILE" | jq -r '@sh "ACCOUNT_ID=\(.ACCOUNT_ID) AWS_DEFAULT_REGION=\(.AWS_DEFAULT_REGION) LOGIN_PASSWORD=\(.LOGIN_PASSWORD)"')

if [ -z "$ACCOUNT_ID" ] || [ -z "$AWS_DEFAULT_REGION" ] || [ -z "$LOGIN_PASSWORD" ]; then
    log "Error: Required environment variables are not set"
    exit 1
fi

# Perform Docker login
log "Attempting Docker login"
if echo "$LOGIN_PASSWORD" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com" > /dev/null 2>&1; then
    log "Docker login successful"
else
    log "Error: Docker login failed"
    exit 1
fi

# Change to the Docker Compose directory
if ! cd "$DOCKER_COMPOSE_DIR"; then
    log "Error: Failed to change to directory $DOCKER_COMPOSE_DIR"
    exit 1
fi

# Perform Docker pull
log "Starting Docker pull"
if docker compose pull >> "$PULL_LOG_FILE" 2>&1; then
    log "Docker pull successful"
else
    log "Error: Docker pull failed. Check the log file at $PULL_LOG_FILE"
    exit 1
fi

# Perform Docker Compose down
log "Stopping existing containers"
if docker compose down >> "$DOWN_LOG_FILE" 2>&1; then
    log "Docker Compose down successful"
else
    log "Error: Docker Compose down failed. Check the log file at $DOWN_LOG_FILE"
    exit 1
fi

# Perform Docker Compose up
log "Starting Docker Compose up"
if docker compose up -d >> "$UP_LOG_FILE" 2>&1; then
    log "Docker Compose up successful"
else
    log "Error: Docker Compose up failed. Check the log file at $UP_LOG_FILE"
    exit 1
fi

log "Script completed successfully"
```
7. Make the script executable by running `chmod +x trigger-docker.sh`

# Setting up the IAM Role and User Policies

### ssm-iam-ec2
- Create User ssm-iam-ec2 and add `AmazonSSMFullAccess` and `AmazonSSMManagedInstanceCore`
- Attatch the policy to the EC2 instance to the IAM Role field.

### codebuild-iam-role
- To the role created during setting up the cloud build setup add `AmazonSSMFullAccess` `AmazonSSMManagedInstanceCore` `AWSCodeCommitReadOnly` and `AmazonEC2ContainerRegistryFullAccess` additional to the default permissions set automatically.

---

## The Setup is now ready for deploy.
- The build can be triggered from the console by **Start build with overrides** option.
 - Set the BE_TAG and FE_TAG to the latest production release tag.
- This can also be run using awscli by running the command `aws codebuild start-build --project-name <project-name> --environment-variables-override name=BE_TAG,value=<tag> name=FE_TAG,value=<tag>`
