# iOS Widget Setup Instructions

## Prerequisites
- Xcode 12.0 or later
- iOS 14.0 or later target
- React Native CLI

## Setup Steps

### 1. Open Your iOS Project in Xcode
```bash
cd ios
open QalbyMuslim.xcworkspace
```

### 2. Create Widget Extension
1. In Xcode, go to **File → New → Target**
2. Choose **iOS** → **Widget Extension**
3. Set Product Name: `QalbyMuslimWidget`
4. Set Bundle Identifier: `com.qalbymuslim.app.QalbyMuslimWidget`
5. Make sure "Include Configuration Intent" is **unchecked**
6. Click **Finish**

### 3. Add App Group Capability
1. Select your main app target (`QalbyMuslim`)
2. Go to **Signing & Capabilities**
3. Click **+ Capability** → Add **App Groups**
4. Add group: `group.com.qalbymuslim.app`

5. Select your widget target (`QalbyMuslimWidget`)
6. Go to **Signing & Capabilities**
7. Click **+ Capability** → Add **App Groups**
8. Add the same group: `group.com.qalbymuslim.app`

### 4. Replace Widget Files
1. Replace the contents of `QalbyMuslimWidget.swift` with the provided code
2. Replace the contents of `Info.plist` in the widget folder with the provided code

### 5. Add Native Bridge Files
1. Add `WidgetData.swift` to your main app target
2. Add `WidgetData.m` to your main app target
3. Make sure both files are added to the main app target (not the widget target)

### 6. Update iOS Deployment Target
1. Select your project in the navigator
2. Set **iOS Deployment Target** to **14.0** for both targets:
   - Main app target
   - Widget extension target

### 7. Build and Run
1. Select your main app target
2. Build and run: `Cmd + R`
3. The widget will be available in the widget gallery

## Adding Widget to Home Screen

1. Long press on the home screen
2. Tap the **+** button in the top-left corner
3. Search for "Qalby Muslim"
4. Choose your desired widget size:
   - **Medium**: Shows current ayah and time to next prayer
   - **Large**: Shows ayah, location, and prayer times grid
5. Tap **Add Widget**

## Widget Features

### Medium Widget
- Daily Arabic verse (Ayah)
- English translation
- Surah reference
- Time countdown to next prayer

### Large Widget
- All medium widget features
- Current location
- Prayer times grid (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Current prayer highlighting

## Data Sync
The widget automatically syncs with your app data:
- Updates every 15 minutes
- Shows real-time prayer countdown
- Rotates through daily verses
- Reflects your current location

## Troubleshooting

### Widget Not Updating
1. Make sure app groups are properly configured
2. Check that both targets have the same group ID
3. Ensure iOS deployment target is 14.0+
4. Try removing and re-adding the widget

### Build Errors
1. Clean build folder: `Cmd + Shift + K`
2. Make sure all files are in the correct targets
3. Check that Swift files are added to the main app target
4. Verify bundle identifiers are correct

### Widget Not Appearing
1. Check iOS version (14.0+ required)
2. Make sure widget extension was created properly
3. Verify app group capabilities are enabled
4. Try restarting the device

## Customization

You can customize the widget by modifying:
- Colors in the `LinearGradient` sections
- Font sizes and styles
- Layout spacing and padding
- Prayer time display format

## Updates
The widget will automatically update when:
- Prayer times change
- Current prayer changes
- Location changes
- Daily verses rotate
- App is opened/refreshed

---

# Xcode Cloud Setup for Production Builds

## Overview
Xcode Cloud provides continuous integration and delivery for your iOS app with widget support. Here's how to configure it for automated builds and TestFlight/App Store deployments.

## Prerequisites
- Apple Developer Program membership
- App Store Connect access
- GitHub/GitLab repository connected to Xcode Cloud
- Xcode 13.0 or later

## Xcode Cloud Configuration

### 1. Enable Xcode Cloud in App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app: **Apps → QalbyMuslim**
3. Go to **Xcode Cloud** tab
4. Click **Get Started** if not already enabled

### 2. Connect Your Repository
1. In Xcode Cloud settings, click **Connect Repository**
2. Choose your Git provider (GitHub, GitLab, etc.)
3. Authorize Xcode Cloud access
4. Select the `Muslimeen` repository

### 3. Create Workflows

#### Production Workflow Configuration
```yaml
# .xcode-cloud/workflows/production.yml
name: Production Build
description: Build and deploy to TestFlight and App Store

start_conditions:
  - branch: main
    files_changed:
      - "**/*.swift"
      - "**/*.m"
      - "**/*.ts"
      - "**/*.tsx"
      - "ios/**"
      - "package.json"

steps:
  - name: Install Dependencies
    script: |
      cd $CI_WORKSPACE
      npm install
      cd ios
      pod install --repo-update

  - name: Build Archive
    archive:
      scheme: QalbyMuslim
      destination: generic/platform=iOS
      configuration: Release

  - name: Test Flight Distribution
    distribute:
      destination: TestFlight
      groups:
        - Internal Testing
        - External Testing

  - name: App Store Distribution
    distribute:
      destination: App Store Connect
      submit_for_review: false
```

#### Development Workflow
```yaml
# .xcode-cloud/workflows/development.yml
name: Development Build
description: Build and test for development

start_conditions:
  - branch: develop
  - pull_request:
      target_branch: main

steps:
  - name: Install Dependencies
    script: |
      cd $CI_WORKSPACE
      npm install
      cd ios
      pod install

  - name: Run Tests
    test:
      scheme: QalbyMuslim
      destination: platform=iOS Simulator,name=iPhone 15,OS=latest

  - name: Build Archive
    archive:
      scheme: QalbyMuslim
      destination: generic/platform=iOS
      configuration: Debug
```

### 4. Environment Variables
Set up the following environment variables in Xcode Cloud:

```bash
# React Native Environment
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.aladhan.com/v1
EXPO_PUBLIC_APP_ENV=production

# iOS Specific
IPHONEOS_DEPLOYMENT_TARGET=14.0
CODE_SIGN_STYLE=Automatic
DEVELOPMENT_TEAM=<YOUR_TEAM_ID>
```

### 5. Build Script Configuration

Create `.xcode-cloud/scripts/ci_pre_xcodebuild.sh`:
```bash
#!/bin/bash

set -e

echo "🚀 Starting Xcode Cloud pre-build script"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci

# Install iOS dependencies
echo "🍎 Installing iOS dependencies..."
cd ios
pod install --repo-update
cd ..

# Generate any required assets
echo "🎨 Generating assets..."
npx expo export:embed

echo "✅ Pre-build script completed successfully"
```

Make it executable:
```bash
chmod +x .xcode-cloud/scripts/ci_pre_xcodebuild.sh
```

### 6. Post-Build Actions

Create `.xcode-cloud/scripts/ci_post_xcodebuild.sh`:
```bash
#!/bin/bash

set -e

echo "🎯 Starting post-build actions"

# Archive build logs
if [ "$CI_XCODEBUILD_ACTION" = "archive" ]; then
    echo "📦 Archiving build completed"
    
    # Send notifications (optional)
    # curl -X POST "https://hooks.slack.com/..." \
    #   -d "{'text': 'QalbyMuslim build completed successfully! 🎉'}"
fi

echo "✅ Post-build actions completed"
```

### 7. Widget-Specific Considerations

#### Update `project.pbxproj` for Widget Target
Ensure your widget extension is properly configured:

1. **Widget Bundle Identifier**: `com.qalbymuslim.app.QalbyMuslimWidget`
2. **App Groups**: `group.com.qalbymuslim.app`
3. **Deployment Target**: iOS 14.0+
4. **Code Signing**: Automatic (managed by Xcode Cloud)

#### Scheme Configuration
1. In Xcode, go to **Product → Scheme → Manage Schemes**
2. Select **QalbyMuslim** scheme
3. Click **Edit**
4. In **Archive** tab, ensure both targets are included:
   - QalbyMuslim (main app)
   - QalbyMuslimWidget (widget extension)

### 8. TestFlight Distribution Setup

#### Configure TestFlight Groups
1. In App Store Connect, go to **TestFlight**
2. Create testing groups:
   - **Internal Testing**: Your team members
   - **External Testing**: Beta testers
3. Add test information for your widget features

#### Beta Test Information
```markdown
What to Test in This Build:

📱 Main App Features:
- Prayer time notifications
- Madhab selection and Asr time updates  
- Real-time countdown to next prayer
- Arabic verses with translations
- Location-based prayer times

🔮 Widget Features:
- Medium widget: Daily verses and prayer countdown
- Large widget: Full prayer times grid
- Auto-sync with main app data
- Real-time updates every 15 minutes

🐛 Known Issues:
- [List any known issues]

💡 Testing Focus:
- Widget data accuracy
- Prayer time calculations
- Notification reliability
- UI consistency across devices
```

### 9. Automated Deployment Pipeline

#### Trigger Conditions
```yaml
# Automatic builds on:
- Push to main branch
- Pull requests to main
- Tagged releases (v1.0.0, v1.1.0, etc.)
- Manual triggers from Xcode Cloud dashboard
```

#### Build Matrix
```yaml
# Test on multiple configurations:
- iOS 14.0 (iPhone 12)
- iOS 15.0 (iPhone 13)  
- iOS 16.0 (iPhone 14)
- iOS 17.0 (iPhone 15)
- iPad OS 14.0+ (iPad Air, iPad Pro)
```

### 10. Production Deployment Checklist

Before deploying to production:

- [ ] Widget displays correctly on all supported devices
- [ ] Prayer times are accurate for different time zones
- [ ] Madhab selection properly updates Asr times
- [ ] Notifications work reliably
- [ ] Arabic text renders properly
- [ ] App group data sharing works
- [ ] Widget updates reflect app changes
- [ ] TestFlight testing completed
- [ ] App Store metadata updated
- [ ] Privacy policy includes widget data usage

### 11. Monitoring and Analytics

#### Xcode Cloud Dashboard
Monitor builds at: https://appstoreconnect.apple.com/teams/ab62a3b4-5c74-4c9d-a1ac-76fb04482f2a/apps/6753021182/ci

Track:
- Build success/failure rates
- Build duration trends  
- Test coverage reports
- Distribution metrics

#### Production Monitoring
```javascript
// Add to your app for crash reporting
import crashlytics from '@react-native-firebase/crashlytics';

// Track widget-specific events
crashlytics().log('Widget data updated successfully');
crashlytics().recordError(new Error('Widget sync failed'));
```

### 12. Troubleshooting Common Issues

#### Build Failures
```bash
# Common fixes:
1. Clean derived data: rm -rf ~/Library/Developer/Xcode/DerivedData
2. Reset package cache: npm ci && cd ios && pod install --repo-update
3. Check environment variables in Xcode Cloud settings
4. Verify code signing certificates are valid
```

#### Widget-Specific Issues
```bash
# Widget not building:
- Ensure widget target has correct bundle ID
- Check app group entitlements match
- Verify iOS deployment target is 14.0+
- Confirm widget Swift files are in correct target
```

#### TestFlight Upload Issues
```bash
# Common solutions:
- Increment build number (CFBundleVersion)
- Check app icon requirements (1024x1024)
- Verify Info.plist values are correct
- Ensure all required metadata is provided
```

### 13. Advanced Configuration

#### Custom Build Phases
Add custom build phases for:
- Automated version bumping
- Asset optimization
- Localization updates
- Security scanning

#### Integration with External Services
```yaml
# Example integrations:
- Slack notifications on build completion
- Firebase deployment triggers
- Crash reporting setup
- Analytics configuration
```

---

## Quick Commands

### Local Development
```bash
# Clean and rebuild
npm run ios:clean && npm run ios

# Test widget in simulator
npx react-native run-ios --simulator="iPhone 15"
```

### Xcode Cloud Management
```bash
# Trigger manual build
xcodebuild -project QalbyMuslim.xcodeproj -scheme QalbyMuslim -destination generic/platform=iOS archive

# Check build status
# Use Xcode Cloud dashboard or xcodebuild -list
```

This comprehensive setup ensures your app and widget are automatically built, tested, and deployed through Xcode Cloud with proper CI/CD practices.