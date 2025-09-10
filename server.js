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
});

// API endpoint to get diagram content
app.get('/api/diagram/:path(*)', (req, res) => {
  const diagramPath = path.join(__dirname, 'diagrams', req.params.path);
  
  try {
    const content = fs.readFileSync(diagramPath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
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
