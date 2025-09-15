# Super User System

Environment-aware super user management system for SongCraft, supporting both local PostgreSQL and Neon deployments.

## Architecture Overview

### Environment Detection

- **Local Development**: PostgreSQL in Docker
- **Neon Dev**: Neon database with development settings
- **Neon Production**: Neon database with production security

### Role Hierarchy

1. `user` - Regular users (default)
2. `support` - Customer support access
3. `admin` - Platform administration
4. `super_admin` - Full system access

## Quick Start

### 1. Run Database Migration

```bash
# For local development
cd songcraft-api
DATABASE_URL="postgresql://songcraft:songcraft_dev_password@localhost:5433/songcraft_dev" npm run add-global-roles

# For Neon environments
DATABASE_URL="your_neon_url" npm run add-global-roles
```

### 2. Bootstrap Your First Super User

```bash
# Make sure the user exists in your app first (sign up normally)
npm run bootstrap-superuser -- admin@yourcompany.com
```

### 3. Start the API

```bash
# The super user system will auto-initialize
npm run dev
```

## API Endpoints

### User Management

```
GET    /admin/users              # List users (Support+)
GET    /admin/users/:id          # User details (Support+)
PUT    /admin/users/:id/role     # Change user role (Admin+)
```

### Organization Management

```
GET    /admin/orgs               # List organizations (Support+)
GET    /admin/orgs/:id           # Organization details (Support+)
```

### System Administration

```
GET    /admin/stats              # System statistics (Super Admin only)
```

## Usage Examples

### Testing with Postman/curl

Since Clerk auth is currently disabled for development, you can test using headers:

```bash
# Test as super admin
curl -H "x-clerk-user-id: local_admin_localhost_com" \
     http://localhost:4500/admin/users

# Test role change
curl -X PUT \
     -H "Content-Type: application/json" \
     -H "x-clerk-user-id: local_admin_localhost_com" \
     -d '{"globalRole": "admin", "reason": "Promoting to admin"}' \
     http://localhost:4500/admin/users/USER_ID/role
```

### In Application Code

```typescript
import { superUserManager, GlobalRole } from "./lib/super-user";

// Check user permissions
const hasAdminAccess = await superUserManager.hasPermission(
  clerkId,
  "edit:all_users"
);

// Require minimum role
await superUserManager.requireRole(clerkId, GlobalRole.ADMIN);

// Change user role
await superUserManager.changeUserRole(
  targetClerkId,
  GlobalRole.SUPPORT,
  currentUserClerkId,
  "Customer support promotion"
);
```

## Environment-Specific Behavior

### Local Development

- ✅ Auto-creates super users on startup
- ✅ Allows direct database role changes
- ✅ Rich logging enabled
- ✅ Works without Clerk (fallback mode)

### Neon Dev

- ✅ Requires Clerk for role management
- ✅ Rich logging for debugging
- ❌ No auto-seeding of super users
- ✅ Audit trail in Neon

### Neon Production

- ✅ Maximum security mode
- ✅ All changes audited
- ❌ Minimal logging for performance
- ✅ Clerk metadata as primary source

## Security Features

### Multi-Factor Authentication

Super users should enable MFA in Clerk dashboard for enhanced security.

### Role Change Validation

- Only super admins can create other super admins
- Admins can manage support and regular users
- All changes require a reason

### Audit Trail

All role changes are logged with:

- Who made the change
- When it happened
- Why it was made
- IP address (when available)

### IP Restrictions

For production, consider implementing IP allowlisting for super user access.

## Troubleshooting

### "User not found" Error

Make sure the user has signed up through the app first. The super user system doesn't create new users, only promotes existing ones.

### "Insufficient permissions" Error

Check the user's current role:

```bash
# In your database
SELECT email, global_role FROM users WHERE email = 'user@example.com';
```

### Clerk Sync Issues

If roles get out of sync between database and Clerk:

```bash
# Re-run the bootstrap script
npm run bootstrap-superuser -- user@example.com
```

### Environment Detection Issues

Check your DATABASE_URL:

```typescript
import { Environment } from "./lib/environment";
console.log(Environment.getConfig());
```

## Migration from Other Systems

### From Simple Role System

If you had a simple role field before:

```sql
-- Migrate existing roles
UPDATE users SET global_role = 'admin' WHERE old_role_field = 'administrator';
UPDATE users SET global_role = 'user' WHERE old_role_field IS NULL;
```

### From External Auth System

The super user system is designed to work alongside Clerk but can be extended to work with other auth providers by modifying the `getRoleFromClerk` method.

## Development

### Adding New Roles

1. Update `GlobalRole` enum in `src/lib/super-user.ts`
2. Update `GLOBAL_PERMISSIONS` mapping
3. Update database constraint in migration
4. Update role hierarchy if needed

### Adding New Permissions

Add to `GLOBAL_PERMISSIONS` object and use with:

```typescript
await superUserManager.hasPermission(clerkId, "your:new:permission");
```

### Testing

The system includes comprehensive logging in development mode. Check console output for role changes and permission checks.

## Production Deployment

### Environment Variables

```bash
# Required
DATABASE_URL=your_neon_production_url
CLERK_SECRET_KEY=your_clerk_secret_key

# Optional
NODE_ENV=production
```

### Security Checklist

- [ ] Enable MFA for all super users
- [ ] Review and minimize super user count
- [ ] Set up monitoring for role changes
- [ ] Configure IP allowlisting if needed
- [ ] Regular audit of super user activity

## Support

For issues with the super user system:

1. Check the console logs (rich logging in dev)
2. Verify environment detection is correct
3. Ensure database migration completed successfully
4. Check Clerk configuration if using remote environments

The system is designed to fail safely - if there are issues, users will get appropriate error messages rather than unexpected access.
