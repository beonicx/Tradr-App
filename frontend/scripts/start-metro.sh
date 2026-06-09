#!/bin/bash

# Start Metro Bundler Only
# This allows you to run iOS and Android in separate tabs

set -e

ENV=${1:-dev}

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Starting Metro Bundler (Port 8081)              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Set environment
case $ENV in
  dev|development)
    echo -e "${GREEN}Environment: DEVELOPMENT${NC}"
    cp .env.development .env
    ;;
  staging)
    echo -e "${GREEN}Environment: STAGING${NC}"
    cp .env.staging .env
    ;;
  prod|production)
    echo -e "${GREEN}Environment: PRODUCTION${NC}"
    cp .env.production .env
    ;;
  *)
    echo -e "${YELLOW}Using current .env file${NC}"
    ;;
esac

echo ""
echo -e "${YELLOW}Current configuration:${NC}"
cat .env | sed 's/^/  /'
echo ""

# Check if Metro is already running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Metro bundler is already running on port 8081${NC}"
  echo ""
  echo "Options:"
  echo "  1. Use the existing Metro instance"
  echo "  2. Stop it first: npm run stop:all"
  exit 1
fi

echo -e "${GREEN}Starting Metro bundler...${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Metro is ready!${NC}"
echo ""
echo "Now you can run in separate tabs:"
echo -e "  ${GREEN}Tab 2:${NC} npm run ios"
echo -e "  ${YELLOW}Tab 3:${NC} npm run android"
echo ""
echo -e "Or use shortcuts:"
echo -e "  ${GREEN}Tab 2:${NC} npm run ios:dev"
echo -e "  ${YELLOW}Tab 3:${NC} npm run android:dev"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Start Metro
npx react-native start --port 8081
