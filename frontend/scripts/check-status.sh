#!/bin/bash

# Check Status of Running Processes

echo "📊 Process Status Check"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check Metro
echo "Metro Bundler (port 8081):"
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
  PID=$(lsof -ti:8081)
  echo "  ✅ Running (PID: $PID)"
  echo "  📍 http://localhost:8081"
else
  echo "  ❌ Not running"
fi
echo ""

# Check if iOS simulator is running
echo "iOS Simulator:"
if pgrep -x "Simulator" > /dev/null; then
  echo "  ✅ Running"
  # Check if app is installed
  if xcrun simctl list | grep -q "Booted"; then
    echo "  📱 Device: $(xcrun simctl list devices | grep Booted | head -1 | sed 's/.*(\(.*\)).*/\1/')"
  fi
else
  echo "  ❌ Not running"
fi
echo ""

# Check if Android emulator is running
echo "Android Emulator:"
if adb devices | grep -q "emulator"; then
  echo "  ✅ Running"
  DEVICE=$(adb devices | grep emulator | head -1 | awk '{print $1}')
  echo "  🤖 Device: $DEVICE"
else
  echo "  ❌ Not running"
  echo "  💡 Start with: ~/Library/Android/sdk/emulator/emulator -avd <device-name>"
fi
echo ""

# Check log files
echo "Log Files:"
if [ -d "logs" ]; then
  for log in logs/*.log; do
    if [ -f "$log" ]; then
      SIZE=$(du -h "$log" | awk '{print $1}')
      echo "  📄 $(basename $log) - $SIZE"
    fi
  done
  if [ ! "$(ls -A logs/*.log 2>/dev/null)" ]; then
    echo "  📂 logs/ directory exists but no log files"
  fi
else
  echo "  📂 No logs/ directory"
fi
echo ""

# Check current environment
echo "Current Environment:"
if [ -f ".env" ]; then
  echo "  ✅ .env file exists"
  API_URL=$(grep API_BASE_URL .env | cut -d '=' -f2)
  echo "  🌐 API: $API_URL"
else
  echo "  ⚠️  No .env file found"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Quick Actions:"
echo "  ./scripts/run-both.sh        - Start both platforms"
echo "  ./scripts/stop-all.sh        - Stop all processes"
echo "  npm run both:dev             - Start with npm"
echo "  ./scripts/run-both-tmux.sh   - Start with tmux layout"
