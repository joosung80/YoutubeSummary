#!/bin/bash

# Script to start YouTube Summary with secrets from GCP Secret Manager
echo "Starting YouTube Summary application with secrets from GCP Secret Manager..."

# Fetch secrets and create .env file
echo "Fetching secrets..."
GEMINI_KEY=$(gcloud secrets versions access latest --secret="gemini-api-key" 2>/dev/null)
SUPADATA_KEY=$(gcloud secrets versions access latest --secret="supadata-api-key" 2>/dev/null)

# Fallback to existing .env if secrets fetch fails
if [ -z "$GEMINI_KEY" ] || [ -z "$SUPADATA_KEY" ]; then
    echo "Failed to fetch secrets from Secret Manager, using existing .env file..."
    if [ ! -f .env ]; then
        echo "Error: No .env file found and Secret Manager access failed"
        exit 1
    fi
else
    echo "Successfully fetched secrets, updating .env file..."
    cat > .env << EOF
VITE_GEMINI_API_KEY=$GEMINI_KEY
VITE_SUPADATA_API_KEY=$SUPADATA_KEY
EOF
fi

# Export environment variables for docker-compose
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Start the application
echo "Starting Docker containers..."
/usr/bin/docker compose up -d

echo "Application started successfully!"
echo "Access URL: http://$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google"):4500"