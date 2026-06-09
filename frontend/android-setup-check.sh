#!/bin/bash

# Android Setup Verification Script
# Run this after completing the Android Studio setup

echo "🔍 Checking Android Development Environment..."
echo ""

# Check Java
echo "1️⃣ Checking Java installation..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    echo "   ✅ Java found: $JAVA_VERSION"
else
    echo "   ❌ Java not found. Please install OpenJDK 11 or 17"
    exit 1
fi

echo ""

# Check ANDROID_HOME
echo "2️⃣ Checking ANDROID_HOME environment variable..."
if [ -z "$ANDROID_HOME" ]; then
    echo "   ⚠️  ANDROID_HOME not set!"
    echo "   📝 Add this to your ~/.zshrc (or ~/.bash_profile):"
    echo ""
    echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/tools"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
    echo ""
    echo "   Then run: source ~/.zshrc"
    echo ""
else
    echo "   ✅ ANDROID_HOME set: $ANDROID_HOME"
fi

echo ""

# Check Android SDK
echo "3️⃣ Checking Android SDK..."
if [ -d "$HOME/Library/Android/sdk" ]; then
    echo "   ✅ Android SDK found at: $HOME/Library/Android/sdk"
else
    echo "   ❌ Android SDK not found. Please install Android Studio and SDK"
    exit 1
fi

echo ""

# Check adb
echo "4️⃣ Checking Android Debug Bridge (adb)..."
if command -v adb &> /dev/null; then
    ADB_VERSION=$(adb --version | head -1)
    echo "   ✅ adb found: $ADB_VERSION"
else
    echo "   ⚠️  adb not found in PATH. Make sure ANDROID_HOME is set correctly"
fi

echo ""

# Check emulator
echo "5️⃣ Checking Android Emulator..."
if command -v emulator &> /dev/null; then
    echo "   ✅ emulator command found"
else
    echo "   ⚠️  emulator not found in PATH"
fi

echo ""

# Check for AVDs
echo "6️⃣ Checking for Android Virtual Devices (AVDs)..."
if command -v emulator &> /dev/null; then
    AVDS=$(emulator -list-avds 2>/dev/null)
    if [ -z "$AVDS" ]; then
        echo "   ⚠️  No AVDs found. Create one in Android Studio:"
        echo "   Tools → Device Manager → Create Device"
    else
        echo "   ✅ Found AVD(s):"
        echo "$AVDS" | sed 's/^/      /'
    fi
else
    echo "   ⚠️  Cannot check AVDs (emulator command not found)"
fi

echo ""

# Check Node and npm
echo "7️⃣ Checking Node.js and npm..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    echo "   ✅ Node: $NODE_VERSION"
    echo "   ✅ npm: $NPM_VERSION"
else
    echo "   ❌ Node.js not found"
    exit 1
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SETUP SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -z "$ANDROID_HOME" ] && command -v adb &> /dev/null; then
    echo "✅ Your Android development environment looks good!"
    echo ""
    echo "📱 To run the app:"
    echo "   1. Start Metro: npm start"
    echo "   2. Run on Android: npm run android"
    echo ""
    echo "💡 The emulator will start automatically, or you can start it manually:"
    if [ ! -z "$AVDS" ]; then
        FIRST_AVD=$(echo "$AVDS" | head -1)
        echo "   emulator -avd $FIRST_AVD &"
    else
        echo "   emulator -avd <AVD_NAME> &"
    fi
else
    echo "⚠️  Setup incomplete. Please:"
    echo "   1. Install Android Studio"
    echo "   2. Set ANDROID_HOME environment variable"
    echo "   3. Create an AVD in Android Studio"
    echo ""
    echo "📖 See ANDROID_SETUP.md for detailed instructions"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
