#!/bin/bash

# Fetch secrets from GCP Secret Manager
echo "Fetching secrets from GCP Secret Manager..."

export VITE_GEMINI_API_KEY=$(gcloud secrets versions access latest --secret="gemini-api-key")
export VITE_SUPADATA_API_KEY=$(gcloud secrets versions access latest --secret="supadata-api-key")

# Verify secrets are loaded
if [ -z "$VITE_GEMINI_API_KEY" ]; then
    echo "Error: Failed to fetch GEMINI_API_KEY from Secret Manager"
    exit 1
fi

if [ -z "$VITE_SUPADATA_API_KEY" ]; then
    echo "Error: Failed to fetch SUPADATA_API_KEY from Secret Manager"
    exit 1
fi

echo "Successfully loaded secrets from GCP Secret Manager"
echo "GEMINI_API_KEY: ${VITE_GEMINI_API_KEY:0:10}..."
echo "SUPADATA_API_KEY: ${VITE_SUPADATA_API_KEY:0:10}..."

# Build and run with docker-compose
echo "Building and starting containers..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo "Application is running at http://localhost:4500"
echo "External access: http://$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google"):4500"