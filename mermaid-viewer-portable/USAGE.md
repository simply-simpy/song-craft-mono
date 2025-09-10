# Mermaid Viewer - Usage Guide

## Quick Start

1. **Copy the folder** to your project
2. **Run setup**: `./setup.sh` (or `npm install && npm run build`)
3. **Start viewer**: `npm run dev`
4. **Open browser**: http://localhost:4200

## Adding Your Diagrams

1. **Create `.mermaid` files** in the `diagrams/` folder
2. **Use any Mermaid syntax**:

   - Flowcharts: `flowchart TD`
   - ER Diagrams: `erDiagram`
   - State Diagrams: `stateDiagram-v2`
   - Gantt Charts: `gantt`
   - And more!

3. **Organize with folders** for better navigation

## Example Usage

```bash
# Start the viewer
npm run dev

# Add a new diagram
echo 'flowchart TD
    A[Start] --> B[Process]
    B --> C[End]' > diagrams/my-flow.mermaid

# The viewer will automatically detect and display it!
```

## Features

- ✅ **Live Reload** - Changes appear instantly
- ✅ **Folder Navigation** - Organize with subfolders
- ✅ **Zoom Controls** - Zoom in/out, reset, full-width
- ✅ **Multiple Formats** - Flowcharts, ER diagrams, state diagrams
- ✅ **Fast Loading** - Pre-built SVGs for instant display
- ✅ **Cross-Platform** - Works on any OS with Node.js

## Customization

- **Change port**: `PORT=3000 npm run dev`
- **Add themes**: Modify the Mermaid config in `public/index.html`
- **Custom styling**: Edit the CSS in `public/index.html`

## Troubleshooting

- **Diagrams not showing**: Check browser console for syntax errors
- **File changes not detected**: Restart the server
- **Build errors**: Verify Mermaid syntax is correct

## File Structure

```
mermaid-viewer-portable/
├── diagrams/           # Your .mermaid files go here
├── public/            # Web interface
├── scripts/           # Build tools
├── server.js          # Express server
├── package.json       # Dependencies
└── README.md          # Full documentation
```

Ready to use! 🚀
