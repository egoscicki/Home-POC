# AWS Deployment Guide for Home Property Valuation Tracker

## 🚀 Quick Fix for "Artifact directory doesn't exist: dist" Error

The error occurs because AWS expects a `dist` directory that doesn't exist. Here's how to fix it:

### **Option 1: Build Locally First (Recommended)**

1. **Install Node.js** (if not already installed)
2. **Run the build command:**
   ```bash
   npm run build
   ```
3. **Verify the dist directory exists:**
   ```bash
   ls -la dist/
   ```
4. **Deploy to AWS** - the dist directory will now exist

### **Option 2: Use AWS Amplify (Automatic Build)**

1. **Connect your GitHub repository** to AWS Amplify
2. **Amplify will automatically run the build** using the `amplify.yml` configuration
3. **No manual build required**

## 🔧 Build Process

### **What the Build Does:**
- Creates a `dist/` directory
- Copies all necessary files:
  - `index.html` - Main application
  - `style.css` - Styling
  - `app.js` - JavaScript functionality
  - `LICENSE` - License file
  - `README.md` - Documentation
- Creates deployment-ready structure

### **Build Commands:**
```bash
# Build the application
npm run build

# Clean build directory
npm run clean

# Deploy preparation
npm run deploy
```

## 🌐 AWS Deployment Options

### **Option 1: AWS S3 + CloudFront (Static Website)**
1. **Build the application:**
   ```bash
   npm run build
   ```
2. **Upload dist/ contents to S3 bucket**
3. **Configure CloudFront for CDN**
4. **Set up custom domain (optional)**

### **Option 2: AWS Amplify (Full CI/CD)**
1. **Connect GitHub repository**
2. **Amplify automatically builds and deploys**
3. **Uses amplify.yml configuration**
4. **Automatic deployments on code changes**

### **Option 3: AWS Elastic Beanstalk**
1. **Build the application:**
   ```bash
   npm run build
   ```
2. **Zip the dist/ directory**
3. **Upload to Elastic Beanstalk**
4. **Configure environment**

## 📁 Project Structure After Build

```
home-poc/
├── dist/                    # ← This is what AWS needs
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── LICENSE
│   ├── README.md
│   └── redirect.html
├── src/                     # Source files
├── build.js                 # Build script
├── amplify.yml              # AWS Amplify config
├── package.json
└── README.md
```

## 🚨 Common Issues & Solutions

### **Issue: "dist directory doesn't exist"**
**Solution:** Run `npm run build` before deploying

### **Issue: "Build failed"**
**Solution:** Check that all source files exist and are valid

### **Issue: "Permission denied"**
**Solution:** Ensure proper AWS IAM permissions

### **Issue: "Build timeout"**
**Solution:** Optimize build process or increase timeout in AWS settings

## 🔍 Verification Steps

### **Before Deployment:**
1. ✅ Run `npm run build`
2. ✅ Verify `dist/` directory exists
3. ✅ Check all files are copied correctly
4. ✅ Test locally with `npm start`

### **After Deployment:**
1. ✅ Verify application loads correctly
2. ✅ Check API connections work
3. ✅ Test property search functionality
4. ✅ Verify Street View images load

## 📋 AWS Amplify Configuration

The `amplify.yml` file configures:
- **Pre-build phase:** Install dependencies
- **Build phase:** Run build script
- **Artifacts:** Use `dist/` directory
- **Cache:** Optimize build performance

## 🎯 Next Steps

1. **Run the build:** `npm run build`
2. **Verify dist/ exists:** `ls -la dist/`
3. **Deploy to AWS** using your preferred method
4. **Test the deployed application**

## 📞 Support

If you encounter issues:
1. Check the build output for errors
2. Verify all source files exist
3. Ensure Node.js is installed
4. Check AWS service permissions

---

**Happy Deploying! 🚀**
