#!/bin/bash

# Local build and test script
# Usage: ./build-local.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔨 Building Docker image locally...${NC}"

# Build the image
docker build -t goldsushi:local .

echo -e "${GREEN}✅ Build completed!${NC}"

# Test the build
echo -e "${YELLOW}🧪 Testing the image...${NC}"

# Run a quick test container
docker run --rm goldsushi:local node --version

echo -e "${GREEN}✅ Image test passed!${NC}"

# Ask if user wants to start local environment
echo -e "${YELLOW}Do you want to start the local development environment? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${GREEN}🚀 Starting local environment...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Environment started!${NC}"
    echo -e "${GREEN}Application running at: http://localhost:4200${NC}"
    echo -e "${GREEN}Swagger docs at: http://localhost:4200/swagger${NC}"
    echo -e "${YELLOW}View logs: docker-compose logs -f${NC}"
fi

