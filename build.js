const fs = require('fs');
const path = require('path');

console.log('🏗️  Building Home Property Valuation Tracker...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// Files to copy
const filesToCopy = [
    'index.html',
    'style.css',
    'app.js',
    'LICENSE',
    'README.md'
];

// Copy files
filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied ${file}`);
    } else {
        console.log(`⚠️  Warning: ${file} not found`);
    }
});

// Create a simple index.html redirect for S3/CloudFront
const redirectHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Home Property Valuation Tracker</title>
    <meta http-equiv="refresh" content="0; url=index.html">
</head>
<body>
    <p>Redirecting to <a href="index.html">Home Property Valuation Tracker</a>...</p>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'redirect.html'), redirectHtml);

console.log('🎉 Build completed successfully!');
console.log(`📁 Dist directory created at: ${distDir}`);
console.log('🚀 Ready for AWS deployment!');
