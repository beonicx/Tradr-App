#!/bin/bash

echo "🔍 Verifying Environment Configuration..."
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
  echo "✅ .env file exists"
  echo "   Current configuration:"
  cat .env | sed 's/^/   /'
else
  echo "⚠️  .env file not found"
  echo "   Creating from .env.development..."
  cp .env.development .env
fi

echo ""

# Check environment files
echo "📄 Environment Files:"
for file in .env.example .env.development .env.staging .env.production; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (missing)"
  fi
done

echo ""

# Check config file
if [ -f "src/config/env.js" ]; then
  echo "✅ Config file exists: src/config/env.js"
else
  echo "❌ Config file missing: src/config/env.js"
fi

echo ""

# Check babel config
if grep -q "react-native-dotenv" babel.config.js; then
  echo "✅ Babel configured for environment variables"
else
  echo "❌ Babel not configured for react-native-dotenv"
fi

echo ""

# Check TypeScript definitions
if [ -f "types/env.d.ts" ]; then
  echo "✅ TypeScript definitions exist: types/env.d.ts"
else
  echo "⚠️  TypeScript definitions missing: types/env.d.ts"
fi

echo ""
echo "✨ Environment setup verification complete!"
echo ""
echo "📝 Quick commands:"
echo "   npm run android:dev      # Run Android in development"
echo "   npm run ios:dev          # Run iOS in development"
echo "   npm run env:staging      # Switch to staging environment"
echo "   ./scripts/switch-env.sh  # Interactive environment switcher"
