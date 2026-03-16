#!/bin/bash

# Deployment script for Digital Ocean
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
IMAGE_NAME="goldsushi"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"your-registry.com"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

echo -e "${GREEN}🚀 Starting deployment for ${ENVIRONMENT} environment${NC}"

# Step 1: Build Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

# Step 2: Tag image for registry
echo -e "${YELLOW}🏷️  Tagging image for registry...${NC}"
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest

# Step 3: Push to registry
echo -e "${YELLOW}⬆️  Pushing image to registry...${NC}"
docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest

# Step 4: Deploy to Digital Ocean (via SSH)
if [ -n "$DROPLET_IP" ] && [ -n "$SSH_USER" ]; then
    echo -e "${YELLOW}🌊 Deploying to Digital Ocean droplet...${NC}"

    # Copy docker-compose file
    scp docker-compose.prod.yml ${SSH_USER}@${DROPLET_IP}:~/goldsushi/
    scp nginx.conf ${SSH_USER}@${DROPLET_IP}:~/goldsushi/
    scp .env ${SSH_USER}@${DROPLET_IP}:~/goldsushi/.env

    # SSH and deploy
    ssh ${SSH_USER}@${DROPLET_IP} << 'ENDSSH'
        cd ~/goldsushi

        # Pull latest image
        docker-compose -f docker-compose.prod.yml pull

        # Stop and remove old containers
        docker-compose -f docker-compose.prod.yml down

        # Start new containers
        docker-compose -f docker-compose.prod.yml up -d

        # Clean up old images
        docker image prune -f

        echo "Deployment completed!"
ENDSSH

    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${YELLOW}⚠️  DROPLET_IP or SSH_USER not set. Skipping remote deployment.${NC}"
    echo -e "${YELLOW}Image has been built and pushed to registry.${NC}"
    echo -e "${YELLOW}To deploy manually, run on your droplet:${NC}"
    echo -e "${YELLOW}docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}${NC}"
    echo -e "${YELLOW}docker-compose -f docker-compose.prod.yml up -d${NC}"
fi

echo -e "${GREEN}🎉 Deployment process completed!${NC}"

