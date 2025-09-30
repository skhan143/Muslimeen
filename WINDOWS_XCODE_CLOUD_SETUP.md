# 🪟 Windows → iOS: Xcode Cloud Setup Guide

**Build and deploy iOS apps with widgets entirely from Windows using Apple's cloud!**

## 🎯 Overview

You can now build, test, and deploy your QalbyMuslim iOS app (including the widget) entirely from Windows using Xcode Cloud - no Mac required!

## ✅ Prerequisites

- ✅ **Apple Developer Account** ($99/year)
- ✅ **App Store Connect Access** 
- ✅ **GitHub Repository** (already set up)
- ✅ **Windows PC** (you have this!)

## 🚀 Step-by-Step Setup (Windows)

### Step 1: Push Widget Files to GitHub

```powershell
# Ensure all widget files are committed (already done!)
git status
git push origin main
```

### Step 2: App Store Connect Configuration

1. **Open Browser** → Go to [App Store Connect](https://appstoreconnect.apple.com/teams/ab62a3b4-5c74-4c9d-a1ac-76fb04482f2a/apps/6753021182/ci)

2. **Navigate to Your App** → QalbyMuslim → **Xcode Cloud** tab

3. **Connect Repository**:
   - Click **Get Started** or **Connect SCM**
   - Choose **GitHub**
   - Select your repository: `skhan143/Muslimeen`
   - Grant access permissions

4. **Initial Configuration**:
   - **Primary Branch**: `main`
   - **Xcode Version**: Latest available
   - **Project/Workspace**: Auto-detect

### Step 3: Environment Variables Setup

In **Xcode Cloud → Settings → Environment Variables**, add:

```bash
# Essential Variables
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.aladhan.com/v1
EXPO_PUBLIC_APP_ENV=production
IPHONEOS_DEPLOYMENT_TARGET=14.0

# App Info
MARKETING_VERSION=1.0
CURRENT_PROJECT_VERSION=1

# Build Configuration
CI=true
GENERATE_SOURCEMAP=false
```

### Step 4: API Key for TestFlight (Required)

1. **App Store Connect** → **Users and Access** → **Keys**
2. **Generate API Key**:
   - **Name**: "Xcode Cloud QalbyMuslim"
   - **Access**: **Developer** role
   - **Download** the `.p8` file

3. **Add to Xcode Cloud**:
   - **API Key ID**: (from the key details)
   - **Issuer ID**: (from Users and Access page)
   - **Upload**: The `.p8` file

### Step 5: Workflow Configuration

Your workflows are already configured! They will:

**🔄 Production Workflow** (`main` branch):
- ✅ Build app + widget
- ✅ Run tests
- ✅ Upload to TestFlight
- ✅ Send notifications

**🧪 Development Workflow** (`develop` branch):
- ✅ Build and test only
- ✅ No TestFlight upload
- ✅ Quick feedback

### Step 6: Verify Setup

1. **Check Files**: Ensure these are in your repo:
   ```
   .xcode-cloud/
   ├── workflows/
   │   ├── production.yml
   │   └── development.yml
   └── scripts/
       ├── ci_pre_xcodebuild.sh
       └── ci_post_xcodebuild.sh
   ```

2. **Verify Widget Files**:
   ```
   ios/
   ├── QalbyMuslimWidget/
   │   ├── QalbyMuslimWidget.swift
   │   └── Info.plist
   └── QalbyMuslim/
       ├── WidgetData.swift
       └── WidgetData.m
   ```

## 🎯 First Build Test

### Option A: Automatic Trigger
```powershell
# Make a small change and push to trigger build
echo "# iOS Widget Ready!" >> README.md
git add README.md
git commit -m "Trigger first Xcode Cloud build"
git push origin main
```

### Option B: Manual Trigger
1. **App Store Connect** → **Xcode Cloud** → **Builds**
2. **Start Build** → Choose **Production** workflow
3. **Monitor Progress** in dashboard

## 📊 Monitor Your Build

**Dashboard**: https://appstoreconnect.apple.com/teams/ab62a3b4-5c74-4c9d-a1ac-76fb04482f2a/apps/6753021182/ci

**Build Stages**:
1. 🔄 **Preparing** (1-2 min)
2. 📦 **Installing Dependencies** (3-5 min)
3. 🔨 **Building** (5-10 min)
4. 🧪 **Testing** (2-3 min)
5. 📤 **Uploading to TestFlight** (2-3 min)

**Total Time**: ~15-20 minutes

## 🔔 Optional: Notifications Setup

Add webhook URLs to get build notifications:

### Slack
```bash
# Environment Variable:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Discord
```bash
# Environment Variable:
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```

### Microsoft Teams
```bash
# Environment Variable:
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/WEBHOOK/URL
```

## 🎉 Success! What You Get

Once setup is complete, every push to `main` will:

1. **🤖 Automatically Build** your iOS app + widget in Apple's cloud
2. **🧪 Run Tests** to ensure quality
3. **📱 Upload to TestFlight** for beta testing
4. **🔔 Notify You** of build status
5. **📊 Provide Detailed Reports** of the build process

## 🚀 Testing Your Widget

### TestFlight Testing
1. **Install TestFlight** on your iPhone
2. **Accept Invitation** (sent automatically after build)
3. **Download & Install** your app
4. **Add Widget**: Long-press home screen → Add Widget → QalbyMuslim
5. **Test Features**: Prayer times, Ayah display, location updates

### Widget Features to Test
- ✅ **Prayer Times Display** in Medium/Large widgets
- ✅ **Daily Ayah** from your Top Card
- ✅ **Location Information** 
- ✅ **Real-time Updates** when app data changes
- ✅ **Islamic Design** with golden gradients

## 🔧 Troubleshooting

### Build Fails?
1. **Check Logs** in Xcode Cloud dashboard
2. **Common Issues**:
   - Missing environment variables
   - API key permissions
   - Script permission errors

### Fix Script Permissions
```powershell
# If build fails due to script permissions:
git update-index --chmod=+x .xcode-cloud/scripts/ci_pre_xcodebuild.sh
git update-index --chmod=+x .xcode-cloud/scripts/ci_post_xcodebuild.sh
git commit -m "Fix script permissions"
git push origin main
```

### Widget Not Building?
- Ensure all widget files are committed
- Check that Info.plist has correct bundle identifier
- Verify App Groups configuration in future Xcode setup

## 🎯 Next Steps

1. **✅ Complete Setup** (Steps 1-6 above)
2. **🔨 Trigger First Build** (Option A or B)
3. **📱 Test on TestFlight** 
4. **🎉 Deploy to App Store** when ready

## 💡 Pro Tips

- **Monitor Builds**: Keep dashboard open during first few builds
- **Test Early**: Use TestFlight to catch issues before App Store
- **Iterate Fast**: Small changes → quick builds → rapid feedback
- **Use Branches**: `develop` for testing, `main` for releases

---

**🎉 Congratulations!** 

You can now build iOS apps with widgets entirely from Windows using Apple's cloud infrastructure. Your QalbyMuslim Top Card widget will be available on iOS home screens worldwide! 🕌📱✨