#!/bin/bash

# Fix iOS Build Issues

set -e

echo "🔧 Fixing iOS Build Issues..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Cleaning iOS build...${NC}"
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/TradingApp-*
echo -e "${GREEN}✓ Build cleaned${NC}"
echo ""

echo -e "${BLUE}Step 2: Cleaning Pods...${NC}"
rm -rf Pods
rm -f Podfile.lock
echo -e "${GREEN}✓ Pods cleaned${NC}"
echo ""

echo -e "${BLUE}Step 3: Installing Pods...${NC}"
pod install --repo-update
echo -e "${GREEN}✓ Pods installed${NC}"
echo ""

cd ..

echo -e "${BLUE}Step 4: Cleaning Metro cache...${NC}"
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
echo -e "${GREEN}✓ Metro cache cleaned${NC}"
echo ""

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ iOS build environment fixed!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Now try running:"
echo -e "  ${BLUE}npm run ios${NC}"
echo ""
