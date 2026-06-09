#!/bin/bash

# Android Rebuild Script - Clean and rebuild Android app
# This fixes most connection and cache issues

echo "🔧 Android Clean & Rebuild Script"
echo "=================================="
echo ""

# Get the directory where script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if backend is running
echo "📡 Checking backend connection..."
BACKEND_CHECK=$(curl -s http://10.150.2.251:5003/health 2>&1)
if [[ $BACKEND_CHECK == *"status"* ]]; then
    echo "✅ Backend is running and accessible"
else
    echo "⚠️  WARNING: Backend may not be running or not accessible"
    echo "   Start it with: cd backend && npm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Copy development env
echo ""
echo "📝 Setting up environment..."
cp .env.development .env
echo "✅ Copied .env.development to .env"

# Clean Android build
echo ""
echo "🧹 Cleaning Android build..."
cd android
./gradlew clean
if [ $? -eq 0 ]; then
    echo "✅ Android build cleaned"
else
    echo "❌ Failed to clean Android build"
    exit 1
fi
cd ..

# Clean Metro cache
echo ""
echo "🧹 Cleaning Metro cache..."
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null
echo "✅ Metro cache cleaned"

# Kill any running Metro instances
echo ""
echo "🛑 Stopping existing Metro bundler..."
pkill -f "react-native start" || true
pkill -f "metro" || true
sleep 1
echo "✅ Stopped Metro bundler"

echo ""
echo "🚀 Starting fresh Metro bundler..."
echo "   (This will run in the background)"
echo ""

# Start Metro with reset cache in background
npx react-native start --reset-cache > /tmp/metro-log.txt 2>&1 &
METRO_PID=$!
echo "   Metro PID: $METRO_PID"
echo "   View logs: tail -f /tmp/metro-log.txt"

# Wait for Metro to be ready
echo ""
echo "⏳ Waiting for Metro to be ready..."
sleep 5

# Check if Metro is running
if ps -p $METRO_PID > /dev/null; then
    echo "✅ Metro bundler is running"
else
    echo "❌ Metro failed to start. Check /tmp/metro-log.txt"
    exit 1
fi

echo ""
echo "📱 Building and launching Android app..."
echo "   (This may take a few minutes)"
echo ""

# Build and run Android
npm run android

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! App should be running on your device"
    echo ""
    echo "📊 Next Steps:"
    echo "   1. Watch logs: npx react-native log-android"
    echo "   2. Look for: '✅ SUCCESS! Backend is reachable'"
    echo "   3. Test login/register functionality"
    echo ""
    echo "🔍 Debugging:"
    echo "   - Metro logs: tail -f /tmp/metro-log.txt"
    echo "   - App logs: npx react-native log-android"
    echo "   - Backend: curl http://10.150.2.251:5003/health"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    echo ""
    echo "Common fixes:"
    echo "   1. Ensure Android Studio is installed"
    echo "   2. Check ANDROID_HOME is set"
    echo "   3. Ensure device is connected: adb devices"
    echo "   4. Try: cd android && ./gradlew clean"
    echo ""
    exit 1
fi
