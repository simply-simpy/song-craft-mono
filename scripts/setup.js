#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎵 Setting up Songcraft Monorepo...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json') || !fs.existsSync('songcraft') || !fs.existsSync('songcraft-api')) {
  console.error('❌ Please run this script from the root of the songcraft-mono directory');
  process.exit(1);
}

try {
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n🔧 Installing workspace dependencies...');
  execSync('npm run install:workspaces', { stdio: 'inherit' });

  console.log('\n🏗️ Building shared package...');
  execSync('npm run build --workspace=@songcraft/shared', { stdio: 'inherit' });

  console.log('\n✅ Setup complete! You can now run:');
  console.log('  npm run dev          # Start both frontend and API');
  console.log('  npm run dev:songcraft # Start only frontend');
  console.log('  npm run dev:api      # Start only API');
  console.log('\n🎉 Happy coding!');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
