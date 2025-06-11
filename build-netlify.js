import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the dist/public directory exists
const distDir = path.join(__dirname, 'dist/public');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy robots.txt to the dist/public directory
const robotsSrc = path.join(__dirname, 'robots.txt');
const robotsDest = path.join(distDir, 'robots.txt');

if (fs.existsSync(robotsSrc)) {
  fs.copyFileSync(robotsSrc, robotsDest);
  console.log('Copied robots.txt to dist/public');
} else {
  console.log('robots.txt not found in root directory');
}

// Copy sitemap.xml to the dist/public directory
const sitemapSrc = path.join(__dirname, 'sitemap.xml');
const sitemapDest = path.join(distDir, 'sitemap.xml');

if (fs.existsSync(sitemapSrc)) {
  fs.copyFileSync(sitemapSrc, sitemapDest);
  console.log('Copied sitemap.xml to dist/public');
} else {
  console.log('sitemap.xml not found in root directory');
}

// Copy _redirects to the dist/public directory
const redirectsSrc = path.join(__dirname, '_redirects');
const redirectsDest = path.join(distDir, '_redirects');

if (fs.existsSync(redirectsSrc)) {
  fs.copyFileSync(redirectsSrc, redirectsDest);
  console.log('Copied _redirects to dist/public');
} else {
  console.log('_redirects not found in root directory');
}

console.log('Netlify build preparation complete');