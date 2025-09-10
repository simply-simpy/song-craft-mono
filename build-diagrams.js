import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

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

// Generate SVG from Mermaid content
async function generateSVG(content) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
    </head>
    <body>
      <div class="mermaid">${content}</div>
      <script>
        mermaid.initialize({ startOnLoad: true });
      </script>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  await page.waitForSelector('.mermaid svg', { timeout: 10000 });
  
  const svg = await page.evaluate(() => {
    const svgElement = document.querySelector('.mermaid svg');
    return svgElement ? svgElement.outerHTML : null;
  });
  
  await browser.close();
  return svg;
}

// Build all diagrams
async function buildDiagrams() {
  console.log('🔨 Building Mermaid diagrams...');
  
  const mermaidFiles = findMermaidFiles(diagramsDir);
  console.log(`Found ${mermaidFiles.length} Mermaid files`);
  
  const results = {
    success: 0,
    failed: 0,
    files: []
  };
  
  for (const file of mermaidFiles) {
    try {
      console.log(`Building: ${file.path}`);
      
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const svg = await generateSVG(content);
      
      if (svg) {
        // Create output directory structure
        const outputDir = path.join(buildDir, path.dirname(file.path));
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save SVG
        const outputPath = path.join(buildDir, file.path.replace(/\.(mermaid|mmd)$/, '.svg'));
        fs.writeFileSync(outputPath, svg);
        
        // Save metadata
        const metadata = {
          name: file.name,
          path: file.path,
          type: 'mermaid',
          svgPath: file.path.replace(/\.(mermaid|mmd)$/, '.svg'),
          lastBuilt: new Date().toISOString()
        };
        
        const metadataPath = path.join(buildDir, file.path.replace(/\.(mermaid|mmd)$/, '.json'));
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        
        results.success++;
        results.files.push(metadata);
        console.log(`✅ Built: ${file.path}`);
      } else {
        throw new Error('SVG generation failed');
      }
    } catch (error) {
      console.error(`❌ Failed to build ${file.path}:`, error.message);
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
  
  console.log(`\n🎉 Build complete!`);
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📁 Output: ${buildDir}`);
}

// Run build
buildDiagrams().catch(console.error);
