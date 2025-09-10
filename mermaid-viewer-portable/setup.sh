#!/bin/bash

echo "🚀 Setting up Mermaid Diagram Viewer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build initial diagrams
echo "🔨 Building initial diagrams..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Diagrams built successfully"
else
    echo "❌ Failed to build diagrams"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the viewer:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:4200"
echo ""
echo "To add your own diagrams:"
echo "  - Create .mermaid files in the diagrams/ folder"
echo "  - Organize with subfolders as needed"
echo "  - The viewer will automatically detect changes"
