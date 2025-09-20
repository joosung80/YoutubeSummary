#!/bin/bash

# Fetch secrets from GCP Secret Manager and set as environment variables
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