#!/bin/bash
# Deployment Script for India Tech Atlas
# Run this script to deploy the application

echo "🚀 Deploying India Tech Atlas..."

# Check if .htaccess exists, if not rename htaccess
if [ ! -f .htaccess ] && [ -f htaccess ]; then
    echo "📝 Renaming htaccess to .htaccess..."
    mv htaccess .htaccess
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backups
mkdir -p server/backups
mkdir -p logs
mkdir -p cache

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 .
chmod 644 *.html *.js *.css *.json *.xml
chmod 600 server/config.php
chmod 755 server/*.php

# Check PHP version
echo "🔍 Checking PHP version..."
php -v

# Check if database is configured
if [ -f server/config.php ]; then
    echo "✅ Configuration file found"
else
    echo "⚠️  Warning: server/config.php not found"
fi

# Run database installation if needed
read -p "Run database installation? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php server/install.php
fi

echo "✅ Deployment complete!"
echo "🌐 Your application is ready at: https://yourdomain.com"

