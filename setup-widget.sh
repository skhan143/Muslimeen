#!/bin/bash

# iOS Widget Setup Script for QalbyMuslim
# This script helps automate the widget setup process

echo "🚀 QalbyMuslim iOS Widget Setup"
echo "================================="

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script must be run on macOS with Xcode installed"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from the App Store"
    exit 1
fi

echo "✅ Xcode detected"

# Navigate to project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "📁 Project directory: $PROJECT_DIR"

# Check for required files
echo "🔍 Checking required files..."

required_files=(
    "ios/QalbyMuslimWidget/QalbyMuslimWidget.swift"
    "ios/QalbyMuslimWidget/Info.plist"
    "ios/QalbyMuslim/WidgetData.swift"
    "ios/QalbyMuslim/WidgetData.m"
    "src/utils/WidgetDataManager.ts"
    "WIDGET_SETUP.md"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        exit 1
    fi
done

echo ""
echo "📋 Next Steps:"
echo "1. Open the project in Xcode:"
echo "   open ios/QalbyMuslim.xcworkspace"
echo ""
echo "2. Follow the detailed setup instructions in WIDGET_SETUP.md"
echo ""
echo "3. Key tasks to complete in Xcode:"
echo "   • Add Widget Extension target"
echo "   • Configure App Groups"
echo "   • Add native modules to bridge"
echo "   • Build and test the widget"
echo ""
echo "4. For production deployment, see XCODE_CLOUD_SETUP.md"
echo ""

# Offer to open Xcode workspace
read -p "Would you like to open the Xcode workspace now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ -d "ios/QalbyMuslim.xcworkspace" ]]; then
        echo "🚀 Opening Xcode workspace..."
        open ios/QalbyMuslim.xcworkspace
    else
        echo "⚠️  Workspace not found. Opening iOS directory..."
        open ios/
    fi
fi

echo ""
echo "🎉 Setup script completed!"
echo "📖 Read WIDGET_SETUP.md for detailed instructions"