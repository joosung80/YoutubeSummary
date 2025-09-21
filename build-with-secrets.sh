#!/bin/bash

# Build YouTube Summary with GCP Secret Manager integration
echo "🔐 Building YouTube Summary with GCP Secret Manager..."

# Priority: Environment variables first, then GCP Secret Manager
echo "📋 Checking for existing environment variables..."

if [ -n "$VITE_GEMINI_API_KEY" ] && [ -n "$VITE_SUPADATA_API_KEY" ]; then
    echo "✅ Using existing environment variables"
    echo "GEMINI_API_KEY: ${VITE_GEMINI_API_KEY:0:10}..."
    echo "SUPADATA_API_KEY: ${VITE_SUPADATA_API_KEY:0:10}..."
else
    echo "🔐 Environment variables not found, fetching from GCP Secret Manager..."
    
    # Fetch secrets from GCP Secret Manager
    export VITE_GEMINI_API_KEY=$(gcloud secrets versions access latest --secret="gemini-api-key")
    export VITE_SUPADATA_API_KEY=$(gcloud secrets versions access latest --secret="supadata-api-key")
    
    # Verify secrets are loaded
    if [ -z "$VITE_GEMINI_API_KEY" ]; then
        echo "❌ Error: Failed to fetch GEMINI_API_KEY from Secret Manager"
        exit 1
    fi
    
    if [ -z "$VITE_SUPADATA_API_KEY" ]; then
        echo "❌ Error: Failed to fetch SUPADATA_API_KEY from Secret Manager"
        exit 1
    fi
    
    echo "✅ Successfully loaded secrets from GCP Secret Manager"
    echo "GEMINI_API_KEY: ${VITE_GEMINI_API_KEY:0:10}..."
    echo "SUPADATA_API_KEY: ${VITE_SUPADATA_API_KEY:0:10}..."
fi

# Build and run with docker-compose
echo "🏗️ Building and starting containers..."
docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo "🎉 Application is running at http://localhost:4500"

# Check if running in GCP environment
if curl -s --max-time 2 "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google" >/dev/null 2>&1; then
    EXTERNAL_IP=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google")
    echo "🌐 External access: http://$EXTERNAL_IP:4500"
fi