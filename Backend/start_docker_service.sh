#!/bin/bash

# Usage: install Docker and deploy Elasticsearch, Kibana and Chroma

# Check if Homebrew is installed
brew update

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    brew install --cask docker
    echo "Please start the Docker application and ensure it is running."
    read -p "Press Enter to continue..."
else
    echo "Docker is installed."
fi

# Create Docker network
echo "Creating Docker network 'elastic'..."
docker network create elastic

# Run Elasticsearch container
echo "Starting Elasticsearch container..."
docker run -d \
  --name elasticsearch \
  --net elastic \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.15.0

# Wait for Elasticsearch to start
echo "Waiting for Elasticsearch to start..."
sleep 30  # Wait for 30 seconds to ensure Elasticsearch starts

# Run Kibana container
echo "Starting Kibana container..."
docker run -d \
  --name kibana \
  --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:8.15.0

# Run Chroma container
echo "Starting Chroma container..."
docker run -d \
  --name chroma \
  --net elastic \
  -p 8000:8000 \
  ghcr.io/chroma-core/chroma:0.4.15

echo "All services have been successfully started!"
echo "You can access the services via the following addresses:"
echo "Elasticsearch: http://localhost:9200"
echo "Kibana: http://localhost:5601"
