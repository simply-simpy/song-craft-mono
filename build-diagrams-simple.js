import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const diagramsDir = path.join(__dirname, 'diagrams');
const buildDir = path.join(__dirname, 'public', 'generated');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Find all Mermaid files
function findMermaidFiles(dir, relativePath = '') {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const relativeItemPath = path.join(relativePath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findMermaidFiles(fullPath, relativeItemPath));
    } else if (item.endsWith('.mermaid') || item.endsWith('.mmd')) {
      files.push({
        name: item,
        path: relativeItemPath,
        fullPath: fullPath
      });
    }
  });
  
  return files;
}

// Build all diagrams (just copy and prepare for client-side rendering)
async function buildDiagrams() {
  console.log('🔨 Preparing Mermaid diagrams for client-side rendering...');
  
  const mermaidFiles = findMermaidFiles(diagramsDir);
  console.log(`Found ${mermaidFiles.length} Mermaid files`);
  
  const results = {
    success: 0,
    failed: 0,
    files: []
  };
  
  for (const file of mermaidFiles) {
    try {
      console.log(`Preparing: ${file.path}`);
      
      const content = fs.readFileSync(file.fullPath, 'utf8');
      
      // Create output directory structure
      const outputDir = path.join(buildDir, path.dirname(file.path));
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Copy Mermaid content
      const outputPath = path.join(buildDir, file.path);
      fs.writeFileSync(outputPath, content);
      
      // Save metadata
      const metadata = {
        name: file.name,
        path: file.path,
        type: 'mermaid',
        lastBuilt: new Date().toISOString(),
        content: content
      };
      
      const metadataPath = path.join(buildDir, file.path.replace(/\.(mermaid|mmd)$/, '.json'));
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      results.success++;
      results.files.push(metadata);
      console.log(`✅ Prepared: ${file.path}`);
    } catch (error) {
      console.error(`❌ Failed to prepare ${file.path}:`, error.message);
      results.failed++;
    }
  }
  
  // Save build manifest
  const manifest = {
    buildTime: new Date().toISOString(),
    totalFiles: mermaidFiles.length,
    success: results.success,
    failed: results.failed,
    files: results.files
  };
  
  fs.writeFileSync(path.join(buildDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  
  console.log(`\n🎉 Preparation complete!`);
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📁 Output: ${buildDir}`);
  console.log(`\n💡 Note: This version uses client-side rendering for better compatibility.`);
}

// Run build
buildDiagrams().catch(console.error);
