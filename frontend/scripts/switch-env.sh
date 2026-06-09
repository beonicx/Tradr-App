#!/bin/bash

# Switch Environment Script
# Usage: ./scripts/switch-env.sh [dev|staging|prod]

ENV=${1:-dev}

case $ENV in
  dev|development)
    echo "Switching to DEVELOPMENT environment..."
    cp .env.development .env
    echo "✅ Environment switched to DEVELOPMENT"
    ;;
  staging)
    echo "Switching to STAGING environment..."
    cp .env.staging .env
    echo "✅ Environment switched to STAGING"
    ;;
  prod|production)
    echo "Switching to PRODUCTION environment..."
    cp .env.production .env
    echo "✅ Environment switched to PRODUCTION"
    ;;
  *)
    echo "❌ Invalid environment: $ENV"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

echo ""
echo "Current environment configuration:"
cat .env
echo ""
echo "💡 Restart metro bundler for changes to take effect:"
echo "   npm start -- --reset-cache"
