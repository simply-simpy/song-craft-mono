# Mermaid Diagrams Server

A local server for viewing and managing Mermaid diagrams in the Songcraft project.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open your browser to:

```
http://localhost:4200
```

## Features

- **Interactive Diagram Viewer**: Browse and view all Mermaid diagrams in your `diagrams/` folder
- **File Tree Navigation**: Sidebar shows all `.mermaid`, `.mmd`, and `.md` files organized by folder
- **Live Rendering**: Diagrams are rendered using the latest Mermaid.js
- **Auto-refresh**: Server watches for file changes and updates the interface
- **Error Handling**: Clear error messages for syntax issues or missing files

## File Structure

The server automatically scans the `diagrams/` folder and its subfolders for:

- `.mermaid` files
- `.mmd` files
- `.md` files

## Usage

1. **View Diagrams**: Click on any file in the sidebar to view it
2. **Mermaid Files**: Rendered as interactive diagrams
3. **Markdown Files**: Displayed as formatted text
4. **Error Debugging**: Syntax errors are clearly displayed with helpful messages

## Development

The server uses:

- **Express.js** for the web server
- **Mermaid.js** for diagram rendering
- **Chokidar** for file watching
- **Vanilla JavaScript** for the frontend

## Troubleshooting

- **Port 4200 in use**: Change the PORT variable in `server.js`
- **Diagrams not rendering**: Check browser console for Mermaid syntax errors
- **Files not appearing**: Ensure files are in the `diagrams/` folder with correct extensions
