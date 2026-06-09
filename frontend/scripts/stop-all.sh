#!/bin/bash

# Stop All Running Processes (Metro, iOS, Android)

echo "🛑 Stopping all processes..."
echo ""

# Kill processes from PID files
if [ -f "logs/metro.pid" ]; then
  METRO_PID=$(cat logs/metro.pid)
  if kill -0 $METRO_PID 2>/dev/null; then
    echo "Stopping Metro bundler (PID: $METRO_PID)..."
    kill $METRO_PID 2>/dev/null
  fi
  rm logs/metro.pid
fi

if [ -f "logs/ios.pid" ]; then
  IOS_PID=$(cat logs/ios.pid)
  if kill -0 $IOS_PID 2>/dev/null; then
    echo "Stopping iOS build (PID: $IOS_PID)..."
    kill $IOS_PID 2>/dev/null
  fi
  rm logs/ios.pid
fi

if [ -f "logs/android.pid" ]; then
  ANDROID_PID=$(cat logs/android.pid)
  if kill -0 $ANDROID_PID 2>/dev/null; then
    echo "Stopping Android build (PID: $ANDROID_PID)..."
    kill $ANDROID_PID 2>/dev/null
  fi
  rm logs/android.pid
fi

# Kill any remaining processes on port 8081
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Killing processes on port 8081..."
  lsof -ti:8081 | xargs kill -9 2>/dev/null || true
fi

# Kill any node processes related to metro
pkill -f "react-native start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

echo ""
echo "✅ All processes stopped"
echo "   Port 8081 is now free"
