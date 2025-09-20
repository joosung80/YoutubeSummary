#!/bin/bash

# Docker build script for YouTube Summary App
set -e

echo "🚀 YouTube Summary App - Docker Build Script"
echo "============================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Please copy .env.example to .env and configure your API keys:"
    echo "   cp .env.example .env"
    echo "   # Edit .env file with your API keys"
    exit 1
fi

# Source environment variables
set -a
source .env
set +a

# Validate required environment variables
if [ -z "$VITE_GEMINI_API_KEY" ] || [ "$VITE_GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo "❌ VITE_GEMINI_API_KEY is not set in .env file"
    echo "🔑 Get your API key from: https://ai.google.dev/"
    exit 1
fi

if [ -z "$VITE_SUPADATA_API_KEY" ] || [ "$VITE_SUPADATA_API_KEY" = "your_supadata_api_key_here" ]; then
    echo "❌ VITE_SUPADATA_API_KEY is not set in .env file"
    echo "🔑 Get your API key from: https://supadata.ai/"
    exit 1
fi

echo "✅ Environment variables validated"

# Get port (default: 4500)
PORT=${PORT:-4500}

echo "🐳 Building Docker image..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting application on port $PORT..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "🎉 YouTube Summary App is running!"
echo "📱 Local access: http://localhost:$PORT"

# Try to get external IP
EXTERNAL_IP=""
if command -v curl >/dev/null 2>&1; then
    EXTERNAL_IP=$(curl -s "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google" 2>/dev/null || echo "")
fi

if [ -n "$EXTERNAL_IP" ]; then
    echo "🌐 External access: http://$EXTERNAL_IP:$PORT"
fi

echo ""
echo "📋 Useful commands:"
echo "   docker-compose -f docker-compose.prod.yml logs -f    # View logs"
echo "   docker-compose -f docker-compose.prod.yml stop       # Stop app"
echo "   docker-compose -f docker-compose.prod.yml down       # Stop and remove"