# Mermaid Charts

## Validation

`find . -name "*.mermaid" -exec sh -c 'npx mmdc -i "$1" -o "/tmp/$(basename "$1").svg" 2>/dev/null && echo "✓ $1" || echo "✗ $1"' _ {} \;`
