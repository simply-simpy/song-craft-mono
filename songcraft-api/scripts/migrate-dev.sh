#!/bin/bash
# Development Migration Script

echo "🔄 Running Drizzle migrations for development..."

# Set development database URL
export DATABASE_URL="postgresql://songcraft:songcraft_dev_password@localhost:5433/songcraft_dev"

# Run migrations
npx drizzle-kit migrate

echo "✅ Development migrations complete!"
