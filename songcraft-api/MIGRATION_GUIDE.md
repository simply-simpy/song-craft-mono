# Drizzle Migration Guide

This guide explains how to use Drizzle migrations for database schema management across all environments.

## **Why Drizzle Migrations?**

- ✅ **Version Control**: Every database change is tracked in git
- ✅ **Team Collaboration**: Everyone gets the same database state
- ✅ **Rollback Support**: Can undo changes if something goes wrong
- ✅ **Environment Consistency**: Same migrations run in dev, staging, production
- ✅ **Professional Database Management**: Industry standard approach

## **Quick Commands**

### **Development**

```bash
# Generate migration from schema changes
npm run db:generate

# Run migrations
npm run db:migrate:dev

# Or use the direct command
npm run db:migrate
```

### **Production**

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Run migrations
npm run db:migrate:prod
```

## **Workflow for Schema Changes**

### **1. Update Schema**

Edit `src/schema.ts` to reflect your desired database changes.

### **2. Generate Migration**

```bash
npm run db:generate
```

This creates a new migration file in `drizzle/` directory.

### **3. Review Migration**

Check the generated SQL in the migration file to ensure it's correct.

### **4. Apply Migration**

```bash
# Development
npm run db:migrate:dev

# Production
npm run db:migrate:prod
```

## **Environment Setup**

### **Development**

- Database: `postgresql://songcraft:songcraft_dev_password@localhost:5433/songcraft_dev`
- Migrations run automatically when starting the backend service

### **Production**

- Set `DATABASE_URL` environment variable
- Run migrations before starting the application
- Consider running migrations in a separate deployment step

## **Docker Integration**

The Docker Compose setup automatically runs migrations when starting the backend service:

```yaml
command: sh -c "npm run db:migrate:dev && npm run dev"
```

## **Migration Files**

- **Location**: `drizzle/` directory
- **Naming**: `0000_description.sql`, `0001_description.sql`, etc.
- **Metadata**: Stored in `drizzle/__drizzle_migrations` table
- **Version Control**: All migration files should be committed to git

## **Troubleshooting**

### **Migration Already Applied**

If you get "relation already exists" errors, the migration was already applied. Check the migration status:

```bash
docker exec songcraft-mono-db-1 psql -U songcraft -d songcraft_dev -c "SELECT * FROM drizzle.__drizzle_migrations;"
```

### **Schema Out of Sync**

If your schema doesn't match the database, use introspection:

```bash
npm run db:introspect
```

This will generate a new schema file based on your current database.

## **Best Practices**

1. **Always review** generated migrations before applying
2. **Test migrations** on a copy of production data
3. **Backup database** before running migrations in production
4. **Use transactions** for complex migrations
5. **Keep migrations small** and focused on single changes
6. **Never edit** applied migration files

## **Migration Status**

Check which migrations have been applied:

```bash
# Development
docker exec songcraft-mono-db-1 psql -U songcraft -d songcraft_dev -c "SELECT * FROM drizzle.__drizzle_migrations;"

# Production (replace with your production database)
psql $DATABASE_URL -c "SELECT * FROM drizzle.__drizzle_migrations;"
```
