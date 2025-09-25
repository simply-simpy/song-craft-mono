#!/bin/bash
# Production Migration Script

echo "🔄 Running Drizzle migrations for production..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is required"
    exit 1
fi

# Run migrations
npx drizzle-kit migrate

echo "✅ Production migrations complete!"
