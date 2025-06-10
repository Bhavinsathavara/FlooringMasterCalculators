# Netlify Deployment Guide

## Quick Fix for 404 Errors

Your site is getting 404 errors because Netlify needs specific configuration for single-page applications (SPAs). Here's how to fix it:

### 1. Update Your Netlify Configuration

Make sure these files are in your project root:

**netlify.toml** (already created):
```toml
[build]
  publish = "dist/public"
  command = "vite build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**_redirects** (already created):
```
/* /index.html 200
```

### 2. Build Settings in Netlify Dashboard

If the above doesn't work, manually configure in Netlify:

1. Go to your site in Netlify dashboard
2. Go to Site Settings > Build & Deploy
3. Set:
   - Build command: `vite build`
   - Publish directory: `dist/public`

### 3. Manual Deploy Steps

1. Run locally: `npm run build`
2. Upload the `dist/public` folder contents to Netlify
3. Or connect your GitHub repo and let Netlify auto-deploy

### 4. Force Redeploy

In Netlify dashboard:
1. Go to Deploys tab
2. Click "Trigger deploy" > "Deploy site"

## Why This Fixes 404s

The 404 errors happen because:
- Your app uses client-side routing (React Router/Wouter)
- When someone visits `/calculator/flooring-cost` directly, Netlify looks for that file
- Since it's a SPA, that file doesn't exist - only `/index.html` exists
- The `_redirects` file tells Netlify to serve `index.html` for all routes
- Then your React app handles the routing client-side

## Verification

After deployment, test these URLs:
- https://flooringmastercalculators.netlify.app/
- https://flooringmastercalculators.netlify.app/calculator/flooring-cost
- https://flooringmastercalculators.netlify.app/calculator/tile
- https://flooringmastercalculators.netlify.app/sitemap.xml

All should work without 404 errors.