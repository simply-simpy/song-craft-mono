import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Songcraft Mermaid Server in development mode...');

// Start the file watcher
console.log('👀 Starting file watcher...');
const watcher = spawn('node', ['watch-diagrams.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Start the server
console.log('🌐 Starting server...');
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  
  watcher.kill('SIGINT');
  server.kill('SIGINT');
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Handle watcher errors
watcher.on('error', (error) => {
  console.error('❌ Watcher error:', error);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Handle watcher exit
watcher.on('close', (code) => {
  console.log(`👀 File watcher exited with code ${code}`);
  if (code !== 0) {
    process.exit(1);
  }
});

// Handle server exit
server.on('close', (code) => {
  console.log(`🌐 Server exited with code ${code}`);
  if (code !== 0) {
    process.exit(1);
  }
});

console.log('✅ Development server started!');
console.log('📱 Open http://localhost:4200 in your browser');
console.log('📝 Edit .mermaid files to see live updates');
console.log('⏹️  Press Ctrl+C to stop');
