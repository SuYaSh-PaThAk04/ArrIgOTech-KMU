#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔨 Starting Render build process...');

try {
  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Change to client directory
  const clientDir = path.join(__dirname, 'client');
  console.log('📂 Changing to client directory:', clientDir);
  
  if (!fs.existsSync(clientDir)) {
    throw new Error('Client directory not found!');
  }

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('npm install --legacy-peer-deps', { cwd: clientDir, stdio: 'inherit' });

  // Build React app
  console.log('🏗️ Building React app...');
  execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

  // Verify build
  const buildDir = path.join(clientDir, 'build');
  if (fs.existsSync(buildDir)) {
    console.log('✅ Build successful! React app built in client/build/');
    const files = fs.readdirSync(buildDir);
    console.log('📁 Build files:', files.join(', '));
  } else {
    throw new Error('Build directory not created!');
  }

  console.log('🎉 Build process completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}