# Mermaid Diagram Viewer

A portable, interactive Mermaid diagram viewer with live reload, folder navigation, and zoom controls.

## Features

- 🎨 **Interactive Diagram Viewer** - View Mermaid diagrams with zoom and full-width modes
- 📁 **Folder Navigation** - Hierarchical file browser with collapsible folders
- 🔄 **Live Reload** - Automatically rebuilds diagrams when files change
- ⚡ **Fast Rendering** - Pre-built SVGs for instant loading
- 🎯 **Easy Setup** - Just install dependencies and run

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the viewer:**

   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:4200
   ```

## Available Scripts

- `npm start` - Build diagrams and start server
- `npm run dev` - Start development mode with file watching
- `npm run build` - Build all diagrams to SVG
- `npm run server` - Start server only
- `npm run watch` - Watch for file changes and rebuild

## Project Structure

```
mermaid-viewer-portable/
├── public/
│   ├── index.html          # Main viewer interface
│   └── generated/          # Pre-built SVG files (auto-generated)
├── diagrams/               # Your Mermaid diagram files
│   ├── sample-flows/       # Example flowcharts
│   ├── sample-db/          # Example database diagrams
│   └── sample-ui/          # Example UI diagrams
├── scripts/
│   ├── build-diagrams-simple.js  # Build script
│   └── watch-diagrams.js         # File watcher
├── server.js               # Express server
├── dev.js                  # Development runner
└── package.json
```

## Adding Your Diagrams

1. **Create `.mermaid` files** in the `diagrams/` folder
2. **Organize with folders** - Create subfolders for better organization
3. **Use any Mermaid syntax** - Flowcharts, ER diagrams, state diagrams, etc.

### Supported File Types

- `.mermaid` - Mermaid diagram files
- `.mmd` - Alternative Mermaid extension
- `.md` - Markdown files (displayed as text)

## Configuration

### Port

Change the port by setting the `PORT` environment variable:

```bash
PORT=3000 npm run dev
```

### File Watching

The viewer automatically watches for changes in the `diagrams/` folder and rebuilds affected diagrams.

## Example Diagrams

The viewer comes with sample diagrams to get you started:

- **User Flow** - Basic authentication flow
- **Checkout Process** - E-commerce checkout steps
- **Database Schema** - Entity relationship diagram
- **API Endpoints** - Microservices architecture
- **Component Hierarchy** - React/Vue component structure
- **State Management** - Application state flow

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Diagrams not loading

- Check browser console for errors
- Ensure Mermaid syntax is valid
- Try refreshing the page

### File changes not detected

- Restart the development server
- Check file permissions
- Ensure files are in the `diagrams/` folder

### Build errors

- Check Mermaid syntax in your files
- Look for console error messages
- Try building individual files

## License

MIT License - feel free to use in your projects!
