#!/bin/sh

# Docker entrypoint script to handle environment variables at runtime
# This allows users to pass API keys without rebuilding the image

echo "YouTube Summary Application Starting..."

# Check if environment variables are provided
if [ -n "$VITE_GEMINI_API_KEY" ] || [ -n "$VITE_SUPADATA_API_KEY" ]; then
    echo "Environment variables detected, updating application config..."
    
    # Find and replace API keys in built files
    if [ -n "$VITE_GEMINI_API_KEY" ]; then
        find /usr/share/nginx/html -name "*.js" -exec sed -i "s/your_gemini_api_key_here/$VITE_GEMINI_API_KEY/g" {} \;
        echo "✓ Gemini API key configured"
    fi
    
    if [ -n "$VITE_SUPADATA_API_KEY" ]; then
        find /usr/share/nginx/html -name "*.js" -exec sed -i "s/your_supadata_api_key_here/$VITE_SUPADATA_API_KEY/g" {} \;
        echo "✓ Supadata API key configured"
    fi
fi

echo "Starting nginx..."

# Execute the original command
exec "$@"