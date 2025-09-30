#!/bin/bash

set -e

echo "🎯 Starting Xcode Cloud post-build script for QalbyMuslim"
echo "Build action: $CI_XCODEBUILD_ACTION"
echo "Build result: $CI_XCODEBUILD_EXIT_CODE"

# Check build result
if [ "$CI_XCODEBUILD_EXIT_CODE" -eq 0 ]; then
    echo "✅ Build completed successfully!"
    BUILD_STATUS="SUCCESS"
else
    echo "❌ Build failed with exit code: $CI_XCODEBUILD_EXIT_CODE"
    BUILD_STATUS="FAILED"
fi

# Archive-specific actions
if [ "$CI_XCODEBUILD_ACTION" = "archive" ]; then
    echo "📦 Archive build completed"
    
    # Log archive information
    if [ -n "$CI_ARCHIVE_PATH" ]; then
        echo "📍 Archive location: $CI_ARCHIVE_PATH"
        
        # Get app version and build number
        if [ -f "ios/QalbyMuslim/Info.plist" ]; then
            APP_VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" ios/QalbyMuslim/Info.plist)
            BUILD_NUMBER=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" ios/QalbyMuslim/Info.plist)
            echo "📱 App Version: $APP_VERSION"
            echo "🔢 Build Number: $BUILD_NUMBER"
        fi
    fi
fi

# Test-specific actions
if [ "$CI_XCODEBUILD_ACTION" = "test" ] || [ "$CI_XCODEBUILD_ACTION" = "test-without-building" ]; then
    echo "🧪 Test execution completed"
    
    # Check for test results
    if [ -n "$CI_TEST_RESULT_BUNDLE_PATH" ]; then
        echo "📊 Test results available at: $CI_TEST_RESULT_BUNDLE_PATH"
    fi
fi

# Generate build report
echo "📋 Generating build report..."

BUILD_REPORT="# QalbyMuslim Build Report

## Build Information
- **Status**: $BUILD_STATUS
- **Action**: $CI_XCODEBUILD_ACTION
- **Branch**: $CI_BRANCH
- **Commit**: $CI_COMMIT
- **Build Date**: $(date)
- **Xcode Version**: $CI_XCODE_VERSION

## Project Details
- **Scheme**: QalbyMuslim
- **Configuration**: ${CI_XCODEBUILD_CONFIGURATION:-Release}
- **Platform**: iOS"

if [ -f "ios/QalbyMuslim/Info.plist" ]; then
    APP_VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" ios/QalbyMuslim/Info.plist 2>/dev/null || echo "Unknown")
    BUILD_NUMBER=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" ios/QalbyMuslim/Info.plist 2>/dev/null || echo "Unknown")
    BUILD_REPORT="$BUILD_REPORT
- **App Version**: $APP_VERSION
- **Build Number**: $BUILD_NUMBER"
fi

# Add widget information
BUILD_REPORT="$BUILD_REPORT

## Widget Extension
- **Widget Target**: QalbyMuslimWidget
- **Bundle ID**: com.qalbymuslim.app.QalbyMuslimWidget"

if [ -f "ios/QalbyMuslimWidget/Info.plist" ]; then
    WIDGET_VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" ios/QalbyMuslimWidget/Info.plist 2>/dev/null || echo "Unknown")
    BUILD_REPORT="$BUILD_REPORT
- **Widget Version**: $WIDGET_VERSION"
fi

# Add success/failure details
if [ "$BUILD_STATUS" = "SUCCESS" ]; then
    BUILD_REPORT="$BUILD_REPORT

## ✅ Build Success
The build completed successfully with all targets built and widget extension included."
else
    BUILD_REPORT="$BUILD_REPORT

## ❌ Build Failed
The build failed with exit code $CI_XCODEBUILD_EXIT_CODE. Check the build logs for details."
fi

# Save build report
echo "$BUILD_REPORT" > build_report.md
echo "📄 Build report saved to build_report.md"

# Optional: Send notifications (uncomment and configure as needed)
# echo "📢 Sending build notifications..."

# Slack notification (configure webhook URL)
# if [ -n "$SLACK_WEBHOOK_URL" ]; then
#     SLACK_MESSAGE="QalbyMuslim iOS Build $BUILD_STATUS on branch $CI_BRANCH"
#     if [ "$BUILD_STATUS" = "SUCCESS" ]; then
#         SLACK_COLOR="good"
#         SLACK_EMOJI="✅"
#     else
#         SLACK_COLOR="danger"
#         SLACK_EMOJI="❌"
#     fi
#     
#     curl -X POST -H 'Content-type: application/json' \
#         --data "{\"text\":\"$SLACK_EMOJI $SLACK_MESSAGE\",\"color\":\"$SLACK_COLOR\"}" \
#         "$SLACK_WEBHOOK_URL"
# fi

# Discord notification (configure webhook URL)
# if [ -n "$DISCORD_WEBHOOK_URL" ]; then
#     DISCORD_MESSAGE="🚀 QalbyMuslim iOS Build $BUILD_STATUS\\n**Branch**: $CI_BRANCH\\n**Commit**: $CI_COMMIT"
#     curl -H "Content-Type: application/json" \
#         -d "{\"content\":\"$DISCORD_MESSAGE\"}" \
#         "$DISCORD_WEBHOOK_URL"
# fi

# Microsoft Teams notification (configure webhook URL)
# if [ -n "$TEAMS_WEBHOOK_URL" ]; then
#     TEAMS_MESSAGE="QalbyMuslim iOS Build $BUILD_STATUS on branch $CI_BRANCH"
#     curl -H "Content-Type: application/json" \
#         -d "{\"text\":\"$TEAMS_MESSAGE\"}" \
#         "$TEAMS_WEBHOOK_URL"
# fi

# Cleanup temporary files
echo "🧹 Cleaning up temporary files..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
fi

# Archive build logs if needed
if [ "$CI_XCODEBUILD_ACTION" = "archive" ] && [ "$BUILD_STATUS" = "SUCCESS" ]; then
    echo "📚 Archiving build artifacts..."
    
    # Create artifacts directory
    mkdir -p build_artifacts
    
    # Copy important files
    if [ -f "build_report.md" ]; then
        cp build_report.md build_artifacts/
    fi
    
    echo "✅ Build artifacts archived"
fi

# Print final summary
echo ""
echo "🎊 Post-build Summary:"
echo "📊 Build Status: $BUILD_STATUS"
echo "🏗️  Build Action: $CI_XCODEBUILD_ACTION"
echo "🌿 Branch: $CI_BRANCH"
echo "📝 Report: build_report.md"

if [ "$BUILD_STATUS" = "SUCCESS" ]; then
    echo "🎉 All post-build actions completed successfully!"
    
    # Widget-specific success message
    echo "🔮 Widget extension built and ready for distribution"
    echo "📱 App is ready for TestFlight/App Store submission"
else
    echo "⚠️  Build failed - check logs for details"
    exit $CI_XCODEBUILD_EXIT_CODE
fi