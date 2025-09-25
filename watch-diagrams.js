import chokidar from 'chokidar';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('👀 Watching for Mermaid file changes...');

// Watch for changes in diagrams directory
const watcher = chokidar.watch('diagrams/**/*.{mermaid,mmd}', {
  ignored: /^\./,
  persistent: true,
  ignoreInitial: true
});

let buildTimeout;
let isBuilding = false;

// Debounced build function
function debouncedBuild() {
  if (isBuilding) {
    console.log('⏳ Build already in progress, skipping...');
    return;
  }
  
  clearTimeout(buildTimeout);
  buildTimeout = setTimeout(async () => {
    isBuilding = true;
    console.log('🔄 File change detected, rebuilding diagrams...');
    
    try {
      const buildProcess = spawn('node', ['build-diagrams.js'], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      buildProcess.on('close', (code) => {
        isBuilding = false;
        if (code === 0) {
          console.log('✅ Rebuild complete!');
        } else {
          console.error('❌ Rebuild failed!');
        }
      });
      
      buildProcess.on('error', (error) => {
        isBuilding = false;
        console.error('❌ Build process error:', error);
      });
    } catch (error) {
      isBuilding = false;
      console.error('❌ Failed to start build process:', error);
    }
  }, 1000); // 1 second debounce
}

// Watch for changes
watcher
  .on('add', (path) => {
    console.log(`📄 File added: ${path}`);
    debouncedBuild();
  })
  .on('change', (path) => {
    console.log(`📝 File changed: ${path}`);
    debouncedBuild();
  })
  .on('unlink', (path) => {
    console.log(`🗑️  File removed: ${path}`);
    debouncedBuild();
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

console.log('🚀 File watcher started. Press Ctrl+C to stop.');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down file watcher...');
  watcher.close();
  process.exit(0);
});
