#!/bin/bash
set -e  # Exit immediately if a command exits with non-zero status

# Build the development image
echo "Building Docker image..."
IMAGE_ID=$(docker build -f Dockerfile.dev -q .)

# Check if the build was successful
if [ -z "$IMAGE_ID" ]; then
  echo "Error: Docker build failed"
  exit 1
fi

echo "Docker image built successfully: $IMAGE_ID"

# Stop and remove any existing container with the same name
echo "Stopping and removing any existing bisque-react-dev container..."
docker rm -f bisque-react-dev 2>/dev/null || true

# Stop any existing container running on port 3000
echo "Stopping any existing containers on port 3000..."
docker stop $(docker ps -q --filter publish=3000) 2>/dev/null || true

# Run the container in development mode
echo "Starting container in development mode..."
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -e CHOKIDAR_USEPOLLING=true \
  -e REACT_APP_BISQUE_URL=http://localhost:8080 \
  --add-host=host.docker.internal:host-gateway \
  --name bisque-react-dev \
  --network bisque-network \
  -d \
  $IMAGE_ID

echo "Container started. React app is running at: http://localhost:3000"