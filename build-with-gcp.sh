#!/bin/bash

# Build and run YouTube Summary with GCP Secret Manager integration
echo "Building YouTube Summary with GCP Secret Manager integration..."

# Set GCP Project ID
export GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT:-pearlplaygroud}

echo "Using GCP Project: $GOOGLE_CLOUD_PROJECT"

# Check if service account key exists
if [ ! -f "./credentials/service-account-key.json" ]; then
    echo "❌ Error: GCP service account key not found at ./credentials/service-account-key.json"
    echo "Please download your service account key from GCP Console and place it in the credentials directory."
    echo ""
    echo "Steps:"
    echo "1. Go to GCP Console > IAM & Admin > Service Accounts"
    echo "2. Create or select a service account with Secret Manager Secret Accessor role"
    echo "3. Create a JSON key and download it"
    echo "4. Place the key file as ./credentials/service-account-key.json"
    exit 1
fi

echo "✅ Service account key found"

# Stop existing containers
echo "Stopping existing containers..."
docker compose down 2>/dev/null || true

# Build and run with docker-compose
echo "Building and starting containers..."
docker compose build --no-cache
docker compose up -d

echo "✅ Application is running at http://localhost:4500"
echo "🔐 API keys are now loaded from GCP Secret Manager at runtime"

# Check if running in GCP environment
if curl -s --max-time 2 "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google" >/dev/null 2>&1; then
    EXTERNAL_IP=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google")
    echo "🌐 External access: http://$EXTERNAL_IP:4500"
fi
