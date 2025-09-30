#!/bin/bash

set -e

echo "🚀 Starting Xcode Cloud pre-build script for QalbyMuslim"
echo "Current directory: $(pwd)"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Print environment info
echo "📊 Environment Information:"
echo "CI_WORKSPACE: $CI_WORKSPACE"
echo "CI_COMMIT: $CI_COMMIT"
echo "CI_BRANCH: $CI_BRANCH"
echo "NODE_ENV: $NODE_ENV"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [ -f "package-lock.json" ]; then
    echo "Found package-lock.json, using npm ci"
    npm ci
else
    echo "No package-lock.json found, using npm install"
    npm install
fi

# Verify React Native CLI
echo "🔍 Checking React Native installation..."
if ! command -v react-native &> /dev/null; then
    echo "Installing React Native CLI globally..."
    npm install -g @react-native-community/cli
fi

# Install iOS dependencies
echo "🍎 Installing iOS dependencies..."
cd ios

# Check if Podfile exists
if [ ! -f "Podfile" ]; then
    echo "❌ Podfile not found in ios directory"
    exit 1
fi

# Clean any existing pods
echo "🧹 Cleaning previous pod installation..."
rm -rf Pods
rm -f Podfile.lock

# Install pods
echo "📱 Installing CocoaPods dependencies..."
pod install --repo-update --clean-install

# Verify pod installation
if [ ! -d "Pods" ]; then
    echo "❌ Pod installation failed"
    exit 1
fi

echo "✅ CocoaPods installation completed"

# Return to root directory
cd ..

# Check for Expo if needed
if grep -q "expo" package.json; then
    echo "📱 Expo detected, checking installation..."
    if ! command -v expo &> /dev/null; then
        echo "Installing Expo CLI..."
        npm install -g @expo/cli
    fi
    
    # Export embedded bundle if using Expo
    echo "📦 Exporting Expo bundle..."
    npx expo export:embed
fi

# Verify critical files exist
echo "🔍 Verifying project structure..."
required_files=(
    "ios/QalbyMuslim.xcworkspace"
    "ios/QalbyMuslim/Info.plist"
    "package.json"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
    echo "✅ Found: $file"
done

# Check widget files
widget_files=(
    "ios/QalbyMuslimWidget/QalbyMuslimWidget.swift"
    "ios/QalbyMuslimWidget/Info.plist"
    "ios/QalbyMuslim/WidgetData.swift"
    "ios/QalbyMuslim/WidgetData.m"
)

echo "🔮 Checking widget extension files..."
for file in "${widget_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Widget file found: $file"
    else
        echo "⚠️  Widget file missing (widget may not work): $file"
    fi
done

# Set up environment for React Native
echo "🌐 Setting up React Native environment..."
export RCT_METRO_PORT=8081

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
if [ -d "ios/build" ]; then
    rm -rf ios/build
fi

# Print summary
echo "📋 Pre-build Summary:"
echo "✅ Node.js dependencies installed"
echo "✅ iOS CocoaPods dependencies installed"
echo "✅ Project structure verified"
echo "✅ Environment configured"

echo "🎉 Pre-build script completed successfully!"
echo "Ready for Xcode build process..."