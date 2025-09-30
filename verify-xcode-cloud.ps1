#!/usr/bin/env pwsh
# Windows PowerShell script to verify Xcode Cloud setup
Write-Host "`n📋 Required for Setup:" -ForegroundColor Cyan
Write-Host "- Apple Developer Account (99 USD/year)" -ForegroundColor White
Write-Host "- App Store Connect access" -ForegroundColor White
Write-Host "- GitHub repository (already set up)" -ForegroundColor White-Host "🚀 QalbyMuslim Xcode Cloud Verification (Windows)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the QalbyMuslim project root" -ForegroundColor Red
    exit 1
}

Write-Host "✅ In QalbyMuslim project directory" -ForegroundColor Green

# Check for required Xcode Cloud files
$requiredFiles = @(
    ".xcode-cloud/workflows/production.yml",
    ".xcode-cloud/workflows/development.yml", 
    ".xcode-cloud/scripts/ci_pre_xcodebuild.sh",
    ".xcode-cloud/scripts/ci_post_xcodebuild.sh",
    "ios/QalbyMuslimWidget/QalbyMuslimWidget.swift",
    "ios/QalbyMuslimWidget/Info.plist",
    "ios/QalbyMuslim/WidgetData.swift",
    "ios/QalbyMuslim/WidgetData.m",
    "src/utils/WidgetDataManager.ts",
    "WIDGET_SETUP.md",
    "XCODE_CLOUD_SETUP.md",
    "WINDOWS_XCODE_CLOUD_SETUP.md"
)

Write-Host "`n🔍 Checking required files..." -ForegroundColor Yellow

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ Some required files are missing!" -ForegroundColor Red
    exit 1
}

# Check git status
Write-Host "`n📦 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
    git status --short
    Write-Host "`n💡 Run these commands to commit:" -ForegroundColor Cyan
    Write-Host "git add ." -ForegroundColor White
    Write-Host "git commit -m 'Update Xcode Cloud configuration'" -ForegroundColor White
    Write-Host "git push origin main" -ForegroundColor White
} else {
    Write-Host "✅ All changes committed" -ForegroundColor Green
}

# Check package.json for expo compatibility
Write-Host "`n📱 Checking Expo configuration..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $package = Get-Content "package.json" | ConvertFrom-Json
    if ($package.dependencies.expo) {
        Write-Host "✅ Expo version: $($package.dependencies.expo)" -ForegroundColor Green
    }
    if ($package.name) {
        Write-Host "✅ App name: $($package.name)" -ForegroundColor Green
    }
}

Write-Host "`n🎯 Next Steps for Windows Users:" -ForegroundColor Cyan
Write-Host "1. Open browser: https://appstoreconnect.apple.com" -ForegroundColor White
Write-Host "2. Navigate to your QalbyMuslim app → Xcode Cloud" -ForegroundColor White
Write-Host "3. Connect your GitHub repository: skhan143/Muslimeen" -ForegroundColor White
Write-Host "4. Follow WINDOWS_XCODE_CLOUD_SETUP.md for detailed steps" -ForegroundColor White

Write-Host "`n📋 Required for Setup:" -ForegroundColor Cyan
Write-Host "• Apple Developer Account (" -NoNewline -ForegroundColor White
Write-Host "💰 $99/year" -NoNewline -ForegroundColor Yellow
Write-Host ")" -ForegroundColor White
Write-Host "• App Store Connect access" -ForegroundColor White
Write-Host "• GitHub repository (✅ already set up)" -ForegroundColor White

Write-Host "`n🔗 Quick Links:" -ForegroundColor Cyan
Write-Host "- App Store Connect: https://appstoreconnect.apple.com" -ForegroundColor Blue
Write-Host "- Your Repository: https://github.com/skhan143/Muslimeen" -ForegroundColor Blue
Write-Host "- Setup Guide: WINDOWS_XCODE_CLOUD_SETUP.md" -ForegroundColor Blue

Write-Host "`n🎉 iOS Widget + Xcode Cloud Setup Complete!" -ForegroundColor Green
Write-Host "Your QalbyMuslim Top Card widget is ready for cloud building! 🕌✨" -ForegroundColor Green