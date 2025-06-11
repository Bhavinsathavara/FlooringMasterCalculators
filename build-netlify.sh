#!/bin/bash

# Create dist/public directory if it doesn't exist
mkdir -p dist/public

# Copy static files to build directory
echo "Copying static files to build directory..."

if [ -f "robots.txt" ]; then
    cp robots.txt dist/public/robots.txt
    echo "✓ Copied robots.txt"
else
    echo "⚠ robots.txt not found"
fi

if [ -f "sitemap.xml" ]; then
    cp sitemap.xml dist/public/sitemap.xml
    echo "✓ Copied sitemap.xml"
else
    echo "⚠ sitemap.xml not found"
fi

if [ -f "_redirects" ]; then
    cp _redirects dist/public/_redirects
    echo "✓ Copied _redirects"
else
    echo "⚠ _redirects not found"
fi

echo "Build preparation complete"