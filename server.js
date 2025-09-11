import express from 'express';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4200;

// Serve static files
app.use(express.static('public'));

// API endpoint to get diagram files
app.get('/api/diagrams', (req, res) => {
  const buildDir = path.join(__dirname, 'public', 'generated');
  const manifestPath = path.join(buildDir, 'manifest.json');
  
  try {
    if (fs.existsSync(manifestPath)) {
      // Use pre-built diagrams
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const files = manifest.files.map(file => ({
        name: file.name,
        path: file.path,
        type: file.type,
        svgPath: file.svgPath,
        lastBuilt: file.lastBuilt
      }));
      res.json(files);
    } else {
      // Fallback to scanning diagrams directory
      const diagramsDir = path.join(__dirname, 'diagrams');
      const files = [];
      
      function scanDirectory(dir, relativePath = '') {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const relativeItemPath = path.join(relativePath, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath, relativeItemPath);
          } else if (item.endsWith('.mermaid') || item.endsWith('.mmd')) {
            files.push({
              name: item,
              path: relativeItemPath,
              fullPath: fullPath,
              type: 'mermaid'
            });
          } else if (item.endsWith('.md')) {
            files.push({
              name: item,
              path: relativeItemPath,
              fullPath: fullPath,
              type: 'markdown'
            });
          }
        });
      }
      
      scanDirectory(diagramsDir);
      res.json(files);
    }
  } catch (error) {
    console.error('Error loading diagrams:', error);
    res.status(500).json({ error: 'Failed to load diagrams' });
  }
});

// API endpoint to get diagram content
app.get('/api/diagram/:path(*)', (req, res) => {
  const buildDir = path.join(__dirname, 'public', 'generated');
  const filePath = path.join(__dirname, 'diagrams', req.params.path);
  const fileExtension = path.extname(req.params.path).toLowerCase();
  
  console.log('Requesting file:', req.params.path, 'Extension:', fileExtension);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Handle different file types
    if (fileExtension === '.md') {
      console.log('Serving markdown content:', filePath);
      res.json({ 
        content,
        type: 'markdown'
      });
    } else if (fileExtension === '.mermaid' || fileExtension === '.mmd') {
      // Try to serve pre-built SVG first for Mermaid files
      const svgPath = path.join(buildDir, req.params.path.replace(/\.(mermaid|mmd)$/, '.svg'));
      const metadataPath = path.join(buildDir, req.params.path.replace(/\.(mermaid|mmd)$/, '.json'));
      
      if (fs.existsSync(svgPath) && fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        const svg = fs.readFileSync(svgPath, 'utf8');
        
        console.log('Serving pre-built SVG:', svgPath);
        res.json({ 
          content: svg,
          type: 'svg',
          lastBuilt: metadata.lastBuilt
        });
      } else {
        console.log('Serving original Mermaid content:', filePath);
        res.json({ 
          content,
          type: 'mermaid'
        });
      }
    } else {
      // Default to text content
      console.log('Serving text content:', filePath);
      res.json({ 
        content,
        type: 'text'
      });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Error reading file: ' + error.message });
  }
});

// Watch for file changes
const watcher = chokidar.watch('diagrams/**/*', {
  ignored: /^\./,
  persistent: true
});

watcher.on('change', (path) => {
  console.log(`File changed: ${path}`);
});

app.listen(PORT, () => {
  console.log(`Mermaid server running at http://localhost:${PORT}`);
  console.log(`Watching diagrams folder for changes...`);
});
