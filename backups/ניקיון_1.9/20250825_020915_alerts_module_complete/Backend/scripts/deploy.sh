#!/bin/bash

# TikTrack Deployment Script
# Usage: ./deploy.sh [staging|production]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
APP_NAME="tiktrack"
DOCKER_IMAGE="${APP_NAME}-${ENVIRONMENT}"
CONTAINER_NAME="${APP_NAME}-${ENVIRONMENT}"

echo -e "${BLUE}🚀 TikTrack Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Build Docker image
print_status "Building Docker image..."
docker build -t ${DOCKER_IMAGE}:latest .

# Stop existing container if running
if docker ps -q -f name=${CONTAINER_NAME} | grep -q .; then
    print_warning "Stopping existing container..."
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
fi

# Remove old images
print_status "Cleaning up old images..."
docker image prune -f

# Run new container
print_status "Starting new container..."
docker run -d \
    --name ${CONTAINER_NAME} \
    --restart unless-stopped \
    -p 8080:8080 \
    -v $(pwd)/db:/app/db \
    -v $(pwd)/logs:/app/logs \
    ${DOCKER_IMAGE}:latest

# Wait for container to start
print_status "Waiting for container to start..."
sleep 10

# Health check
print_status "Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
        print_status "Health check passed!"
        break
    fi
    
    if [ $i -eq 30 ]; then
        print_error "Health check failed after 30 attempts"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
    
    print_warning "Health check attempt $i/30 failed, retrying..."
    sleep 2
done

# Show container status
print_status "Container status:"
docker ps -f name=${CONTAINER_NAME}

# Show logs
print_status "Recent logs:"
docker logs --tail 20 ${CONTAINER_NAME}

print_status "Deployment completed successfully!"
print_status "Application is available at: http://localhost:8080"
print_status "API Documentation: http://localhost:8080/api/docs"

