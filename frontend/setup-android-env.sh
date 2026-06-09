#!/bin/bash

# Android Environment Setup Script
# This script adds Android environment variables to your shell configuration

echo "🔧 Setting up Android environment variables..."
echo ""

# Detect shell
SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
    SHELL_NAME="bash"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    echo "❌ Could not find shell configuration file"
    echo "Please manually add the environment variables to your shell config"
    exit 1
fi

echo "📝 Detected shell: $SHELL_NAME"
echo "📁 Config file: $SHELL_CONFIG"
echo ""

# Check if already configured
if grep -q "ANDROID_HOME" "$SHELL_CONFIG"; then
    echo "⚠️  ANDROID_HOME already exists in $SHELL_CONFIG"
    echo ""
    echo "Current configuration:"
    grep -A 5 "ANDROID_HOME" "$SHELL_CONFIG"
    echo ""
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
    # Remove old configuration
    sed -i.backup '/ANDROID_HOME/d' "$SHELL_CONFIG"
    sed -i.backup '/android-sdk/d' "$SHELL_CONFIG"
fi

# Add Android environment variables
echo "" >> "$SHELL_CONFIG"
echo "# Android Development Environment" >> "$SHELL_CONFIG"
echo "export ANDROID_HOME=\$HOME/Library/Android/sdk" >> "$SHELL_CONFIG"
echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$SHELL_CONFIG"
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$SHELL_CONFIG"
echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> "$SHELL_CONFIG"
echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> "$SHELL_CONFIG"

echo "✅ Android environment variables added to $SHELL_CONFIG"
echo ""
echo "📋 Added configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -6 "$SHELL_CONFIG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 To apply changes, run one of these commands:"
echo ""
if [ "$SHELL_NAME" = "zsh" ]; then
    echo "   source ~/.zshrc"
else
    echo "   source ~/.bash_profile"
fi
echo ""
echo "   OR restart your terminal"
echo ""
echo "✅ Setup complete!"
