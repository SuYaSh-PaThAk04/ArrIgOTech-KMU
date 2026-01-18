#!/bin/bash

echo "🔨 Starting build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build React app
echo "🏗️ Building React app..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build successful! React app built in client/build/"
    ls -la build/
else
    echo "❌ Build failed! No build directory found."
    exit 1
fi

echo "🎉 Build process completed!"