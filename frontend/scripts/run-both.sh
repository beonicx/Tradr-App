#!/bin/bash

# Run Both iOS and Android Simultaneously
# Usage: ./scripts/run-both.sh [dev|staging|prod]

set -e

ENV=${1:-dev}
PROJECT_ROOT=$(pwd)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Running iOS + Android Simultaneously on Metro 8081       ║${NC}"
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
    echo -e "${RED}Invalid environment: $ENV${NC}"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

echo ""
echo -e "${YELLOW}Current environment configuration:${NC}"
cat .env | sed 's/^/  /'
echo ""

# Check if Metro is already running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Metro bundler is already running on port 8081${NC}"
  echo "Using existing Metro instance..."
  METRO_RUNNING=true
else
  echo -e "${GREEN}Starting Metro bundler on port 8081...${NC}"
  METRO_RUNNING=false
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Starting builds...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Create log directory
mkdir -p logs

# Start Metro in background if not running
if [ "$METRO_RUNNING" = false ]; then
  echo -e "${BLUE}[METRO]${NC} Starting bundler..."
  npx react-native start --port 8081 > logs/metro.log 2>&1 &
  METRO_PID=$!
  echo -e "${GREEN}✓${NC} Metro PID: $METRO_PID"
  
  # Wait for Metro to start
  echo -e "${BLUE}[METRO]${NC} Waiting for bundler to be ready..."
  sleep 5
fi

# Start iOS build
echo -e "${GREEN}[iOS]${NC} Starting iOS build..."
npx react-native run-ios --port 8081 > logs/ios.log 2>&1 &
IOS_PID=$!
echo -e "${GREEN}✓${NC} iOS build PID: $IOS_PID"

# Wait a bit before starting Android
sleep 2

# Start Android build
echo -e "${YELLOW}[ANDROID]${NC} Starting Android build..."
npx react-native run-android --port 8081 > logs/android.log 2>&1 &
ANDROID_PID=$!
echo -e "${GREEN}✓${NC} Android build PID: $ANDROID_PID"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ All processes started!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Process IDs:"
if [ "$METRO_RUNNING" = false ]; then
  echo -e "  ${BLUE}Metro:${NC}   $METRO_PID"
fi
echo -e "  ${GREEN}iOS:${NC}     $IOS_PID"
echo -e "  ${YELLOW}Android:${NC} $ANDROID_PID"
echo ""
echo "Log files:"
echo "  logs/metro.log"
echo "  logs/ios.log"
echo "  logs/android.log"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Both platforms share the same Metro bundler (port 8081)"
echo "  • Check logs/ directory for build output"
echo "  • Use 'npm run stop:all' to stop all processes"
echo "  • Metro will serve bundles to both iOS and Android"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop all processes${NC}"
echo ""

# Save PIDs to file for cleanup
if [ "$METRO_RUNNING" = false ]; then
  echo "$METRO_PID" > logs/metro.pid
fi
echo "$IOS_PID" > logs/ios.pid
echo "$ANDROID_PID" > logs/android.pid

# Wait for all processes
wait
