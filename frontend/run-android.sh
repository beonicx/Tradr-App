#!/bin/bash

# Convenient Android Run Script
# This script helps you run your React Native app on Android

set -e

echo "🤖 React Native Android Runner"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME is not set!"
    echo ""
    echo "Please run: ./setup-android-env.sh"
    echo "Then: source ~/.zshrc"
    exit 1
fi

# Check if adb is available
if ! command -v adb &> /dev/null; then
    echo "❌ adb not found in PATH"
    echo ""
    echo "Please run: source ~/.zshrc"
    echo "Or restart your terminal"
    exit 1
fi

echo "✅ Environment configured"
echo ""

# Check for running emulators
RUNNING_DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l | xargs)

if [ "$RUNNING_DEVICES" -eq 0 ]; then
    echo "📱 No Android devices/emulators detected"
    echo ""

    # Check for available AVDs
    if command -v emulator &> /dev/null; then
        AVDS=$(emulator -list-avds 2>/dev/null)

        if [ -z "$AVDS" ]; then
            echo "❌ No Android Virtual Devices (AVDs) found"
            echo ""
            echo "Please create one in Android Studio:"
            echo "   Tools → Device Manager → Create Device"
            exit 1
        fi

        echo "Available emulators:"
        echo "$AVDS" | nl -w2 -s'. '
        echo ""

        # Count AVDs
        AVD_COUNT=$(echo "$AVDS" | wc -l | xargs)

        if [ "$AVD_COUNT" -eq 1 ]; then
            # Only one AVD, use it automatically
            AVD_NAME=$(echo "$AVDS" | head -1)
            echo "🚀 Starting emulator: $AVD_NAME"
            echo ""
            emulator -avd "$AVD_NAME" &

            # Wait for device to be online
            echo "⏳ Waiting for emulator to boot..."
            adb wait-for-device

            # Give it extra time to fully boot
            sleep 5

            echo "✅ Emulator is ready!"
            echo ""
        else
            # Multiple AVDs, let user choose
            echo "Enter the number of the emulator to start (or press Enter to start manually):"
            read -r CHOICE

            if [ ! -z "$CHOICE" ]; then
                AVD_NAME=$(echo "$AVDS" | sed -n "${CHOICE}p")
                if [ ! -z "$AVD_NAME" ]; then
                    echo "🚀 Starting emulator: $AVD_NAME"
                    echo ""
                    emulator -avd "$AVD_NAME" &

                    echo "⏳ Waiting for emulator to boot..."
                    adb wait-for-device
                    sleep 5

                    echo "✅ Emulator is ready!"
                    echo ""
                fi
            else
                echo ""
                echo "Please start an emulator manually, then re-run this script"
                exit 0
            fi
        fi
    fi
else
    echo "✅ Found $RUNNING_DEVICES connected device(s)"
    echo ""
    echo "Connected devices:"
    adb devices | grep "device$"
    echo ""
fi

# Check if Metro is running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Metro bundler is already running"
    echo ""
else
    echo "⚠️  Metro bundler is not running"
    echo ""
    echo "Please start Metro in another terminal:"
    echo "   npm start"
    echo ""
    read -p "Press Enter after starting Metro, or Ctrl+C to cancel..."
    echo ""
fi

# Run the Android build
echo "🏗️  Building and installing app on Android..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run android

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done! Your app should be running on Android"
echo ""
echo "💡 Useful commands:"
echo "   - Reload app: Press 'r' twice in Metro terminal"
echo "   - Dev menu: Cmd+M in terminal, or shake device"
echo "   - View logs: adb logcat"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
