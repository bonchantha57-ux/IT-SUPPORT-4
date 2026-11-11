const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');
const noJekyllPath = path.join(distDir, '.nojekyll');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf-8');

  // Convert absolute root paths to relative paths for GitHub Pages subpath
  html = html.replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');
  html = html.replace(/src="\/_expo\//g, 'src="./_expo/');
  html = html.replace(/url\('\/fonts\//g, "url('./fonts/");

  fs.writeFileSync(indexPath, html, 'utf-8');
  fs.writeFileSync(notFoundPath, html, 'utf-8');
  fs.writeFileSync(noJekyllPath, '', 'utf-8');

  console.log('Successfully prepared dist for GitHub Pages:');
  console.log('- Fixed relative asset paths in index.html');
  console.log('- Created 404.html for SPA routing');
  console.log('- Created .nojekyll to allow _expo static assets');
} else {
  console.error('dist/index.html not found! Run "npx expo export -p web" first.');
  process.exit(1);
}
