# Xcode Cloud Quick Setup Guide

## 🚀 Getting Started with Xcode Cloud

### Step 1: Repository Setup
1. Commit and push all the Xcode Cloud files to your repository:
```bash
git add .xcode-cloud/
git commit -m "Add Xcode Cloud configuration"
git push origin main
```

### Step 2: App Store Connect Configuration
1. Go to [App Store Connect](https://appstoreconnect.apple.com/teams/ab62a3b4-5c74-4c9d-a1ac-76fb04482f2a/apps/6753021182/ci)
2. Navigate to **Xcode Cloud** tab
3. Click **Get Started** (if not already set up)
4. Connect your GitHub repository

### Step 3: Environment Variables
In Xcode Cloud settings, add these environment variables:

```bash
# Required Variables
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.aladhan.com/v1
EXPO_PUBLIC_APP_ENV=production
IPHONEOS_DEPLOYMENT_TARGET=14.0

# Optional Notifications (configure webhook URLs)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
```

### Step 4: API Key Setup (for TestFlight)
1. Go to **App Store Connect → Users and Access → Keys**
2. Create a new API key with **Developer** role
3. Download the key file
4. In Xcode Cloud, add these environment variables:
   - `API_KEY_ID`: Your key ID
   - `API_ISSUER_ID`: Your issuer ID
   - Upload the `.p8` key file

### Step 5: Workflow Triggers
Your workflows will automatically trigger on:
- ✅ Push to `main` branch → Production build
- ✅ Push to `develop` branch → Development build  
- ✅ Pull requests to `main` → Development build
- ✅ Manual triggers from dashboard

## 📱 Widget-Specific Setup

### Required Files Checklist
- [ ] `ios/QalbyMuslimWidget/QalbyMuslimWidget.swift`
- [ ] `ios/QalbyMuslimWidget/Info.plist`
- [ ] `ios/QalbyMuslim/WidgetData.swift`
- [ ] `ios/QalbyMuslim/WidgetData.m`
- [ ] App Groups capability enabled
- [ ] Widget target in main scheme

### Build Verification
After setup, verify your builds include:
1. Main app target (QalbyMuslim)
2. Widget extension target (QalbyMuslimWidget)
3. Shared app group entitlements
4. Proper code signing

## 🔧 Monitoring & Troubleshooting

### Build Dashboard
Monitor builds at: https://appstoreconnect.apple.com/teams/ab62a3b4-5c74-4c9d-a1ac-76fb04482f2a/apps/6753021182/ci

### Common Issues & Solutions

#### 1. Build Fails at Dependency Installation
```bash
# Solution: Check package.json and Podfile
# Ensure all dependencies are compatible
npm audit fix
cd ios && pod repo update && pod install
```

#### 2. Widget Target Not Building
```bash
# Solution: Verify in Xcode
# 1. Check widget target is included in scheme
# 2. Verify bundle identifiers match
# 3. Confirm app group entitlements
```

#### 3. TestFlight Upload Fails
```bash
# Solution: Check these requirements
# 1. Increment build number
# 2. Verify app icons (1024x1024)
# 3. Check Info.plist values
# 4. Ensure API key has correct permissions
```

#### 4. Script Permissions Error
```bash
# Solution: Make scripts executable
chmod +x .xcode-cloud/scripts/*.sh
git add .xcode-cloud/scripts/
git commit -m "Fix script permissions"
git push
```

## 📊 Build Reports

Each build generates a detailed report including:
- Build status and metrics
- App and widget version numbers
- Test results (if applicable)
- Deployment information
- Error logs (if build fails)

## 🔔 Notifications Setup

### Slack Integration
```bash
# Add to environment variables:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Uncomment notification code in ci_post_xcodebuild.sh
```

### Discord Integration
```bash
# Add to environment variables:
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL

# Uncomment notification code in ci_post_xcodebuild.sh
```

## 🚀 Deployment Flow

### Automatic Flow
1. **Code Push** → `main` branch
2. **Build Trigger** → Xcode Cloud starts build
3. **Dependencies** → Install npm & pods
4. **Build & Test** → Compile app + widget
5. **Archive** → Create production archive
6. **TestFlight** → Auto-upload to TestFlight
7. **Notifications** → Send build status alerts

### Manual Deployment
1. Go to Xcode Cloud dashboard
2. Click **Start Build**
3. Select workflow (Production/Development)
4. Monitor build progress
5. Review build report

## 📈 Success Metrics

Track these metrics in your Xcode Cloud dashboard:
- Build success rate (target: >95%)
- Build duration (target: <15 minutes)
- Test coverage (target: >80%)
- TestFlight adoption rate
- Crash-free sessions

## 🎯 Next Steps

1. **Initial Setup**: Complete the configuration above
2. **First Build**: Trigger a test build to verify setup
3. **Widget Testing**: Confirm widget builds and functions correctly
4. **TestFlight**: Test the full app + widget experience
5. **Production**: Deploy to App Store when ready

## 🆘 Support

If you encounter issues:
1. Check Xcode Cloud build logs
2. Review this guide for common solutions
3. Verify all configuration files are correct
4. Test locally before pushing to repository

---

**Quick Start Checklist:**
- [ ] Repository connected to Xcode Cloud
- [ ] Environment variables configured
- [ ] API keys set up for TestFlight
- [ ] Webhook URLs added for notifications
- [ ] Scripts have executable permissions
- [ ] Widget files are in correct targets
- [ ] App groups properly configured
- [ ] First test build completed successfully

Happy building! 🎉