#!/bin/bash

# Start iOS Only
# Run this in a separate tab after Metro is started

set -e

ENV=${1:-current}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Starting iOS Build                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Metro is running
if ! lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "${RED}❌ Metro bundler is not running!${NC}"
  echo ""
  echo "Please start Metro first:"
  echo -e "  ${BLUE}Tab 1:${NC} npm run metro"
  echo ""
  exit 1
fi

echo -e "${GREEN}✓ Metro bundler detected on port 8081${NC}"
echo ""

# Set environment if specified
if [ "$ENV" != "current" ]; then
  case $ENV in
    dev|development)
      echo -e "${BLUE}Switching to DEVELOPMENT environment${NC}"
      cp .env.development .env
      ;;
    staging)
      echo -e "${BLUE}Switching to STAGING environment${NC}"
      cp .env.staging .env
      ;;
    prod|production)
      echo -e "${BLUE}Switching to PRODUCTION environment${NC}"
      cp .env.production .env
      ;;
  esac
  echo ""
fi

echo -e "${GREEN}Building iOS...${NC}"
echo ""

# Start iOS
npx react-native run-ios --port 8081
