# Update System Setup Guide

## 🚀 Overview

I've implemented a comprehensive update system for CHADD that checks for updates from GitHub releases and provides a responsive server browser. Here's what's been added and how to set it up.

## ✨ What's New

### 1. **Responsive Server Browser**

- ✅ Responsive design that works on desktop, tablet, and mobile
- ✅ Better mobile layout with stacked inputs
- ✅ Improved scrolling and touch interactions
- ✅ Close button for better UX
- ✅ Responsive server list and connection forms

### 2. **Enhanced Update System**

- ✅ GitHub releases integration
- ✅ Automatic version comparison
- ✅ Update notifications with release notes
- ✅ Direct download links
- ✅ Error handling and user feedback

## 🛠️ Setup Instructions

### Step 1: Update GitHub Repository URL

In `packages/desktop/src-tauri/src/lib.rs`, line 32, update the repository URL:

```rust
// Change this line:
let repo_url = "https://api.github.com/repos/YOUR_USERNAME/CHADD/releases/latest";

// To your actual repository:
let repo_url = "https://api.github.com/repos/yourusername/CHADD/releases/latest";
```

### Step 2: Build the Application

```bash
# Navigate to the desktop package
cd packages/desktop

# Install dependencies (if not already done)
npm install

# Build the application
npm run tauri build
```

### Step 3: Create GitHub Releases

1. **Go to your GitHub repository**
2. **Click "Releases" → "Create a new release"**
3. **Use semantic versioning** (e.g., `v1.0.1`, `v1.1.0`)
4. **Add release notes** describing changes
5. **Attach the built binaries** from `packages/desktop/src-tauri/target/release/bundle/`

### Step 4: Test the Update System

1. **Change the version** in `packages/desktop/src-tauri/tauri.conf.json`:

   ```json
   {
     "package": {
       "version": "1.0.0"
     }
   }
   ```

2. **Create a release** with version `v1.0.1` on GitHub

3. **Run the app** and click the "Updates" button

4. **You should see** an update dialog if a newer version exists

## 📱 Responsive Features

### Desktop (1200px+)

- Full-width server browser with side-by-side layout
- Large fonts and comfortable spacing
- Full feature set

### Tablet (768px - 1200px)

- Responsive grid layout
- Slightly smaller fonts
- Optimized touch targets

### Mobile (< 768px)

- Stacked input layout
- Smaller fonts and compact spacing
- Touch-optimized buttons
- Simplified header layout

## 🔧 Configuration Options

### Update Check Frequency

You can modify the update check behavior in `App.tsx`:

```typescript
// Add automatic update checks on startup
useEffect(() => {
  // Check for updates on app start (optional)
  setTimeout(() => {
    handleCheckForUpdates();
  }, 5000); // Check after 5 seconds
}, []);
```

### Custom Update Server

If you want to use a different update server, modify the `fetch_latest_release` function in `lib.rs`.

## 🚨 Troubleshooting

### Update Check Fails

- **Check internet connection**
- **Verify GitHub repository URL is correct**
- **Ensure repository is public** (or add authentication for private repos)
- **Check GitHub API rate limits**

### Responsive Issues

- **Test on different screen sizes**
- **Check browser developer tools** for responsive testing
- **Verify CSS media queries** are working correctly

### Build Issues

- **Ensure Rust is installed** and up to date
- **Check Tauri dependencies** are correctly installed
- **Verify Node.js version** compatibility

## 📋 Release Checklist

When creating new releases:

1. ✅ Update version in `tauri.conf.json`
2. ✅ Build the application (`npm run tauri build`)
3. ✅ Test the build locally
4. ✅ Create GitHub release with proper versioning
5. ✅ Attach platform-specific binaries
6. ✅ Add meaningful release notes
7. ✅ Test update system with previous version

## 🎯 Next Steps

1. **Set up your GitHub repository** with the correct URL
2. **Build and test** the responsive server browser
3. **Create your first release** to test the update system
4. **Configure automatic update checks** if desired

The update system will now:

- ✅ Check for updates from GitHub releases
- ✅ Compare versions automatically
- ✅ Show update dialogs with release notes
- ✅ Provide direct download links
- ✅ Handle errors gracefully

The responsive server browser will:

- ✅ Work perfectly on all device sizes
- ✅ Provide better mobile experience
- ✅ Maintain the retro terminal aesthetic
- ✅ Offer improved touch interactions

Enjoy your enhanced CHADD experience! 🎉
