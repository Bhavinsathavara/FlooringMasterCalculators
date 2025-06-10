import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for Netlify deployment...');

// Build the client
execSync('vite build', { stdio: 'inherit' });

// Create dist directory structure for Netlify
const distDir = 'dist';
const publicDir = path.join(distDir, 'public');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy static files to the correct location
const staticFiles = ['sitemap.xml', 'robots.txt', '_redirects'];

staticFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const destPath = path.join(publicDir, file);
    fs.copyFileSync(file, destPath);
    console.log(`Copied ${file} to ${destPath}`);
  }
});

// Copy netlify.toml to dist root
if (fs.existsSync('netlify.toml')) {
  fs.copyFileSync('netlify.toml', path.join(distDir, 'netlify.toml'));
  console.log('Copied netlify.toml to dist/');
}

console.log('Netlify build complete!');