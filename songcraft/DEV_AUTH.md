# Development Authentication Setup

This document explains how to configure development authentication for local development when Clerk authentication is not available or desired.

## Overview

The application uses Clerk for authentication in production, but for local development, you can enable a mock authentication mode to bypass the need for Clerk setup.

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Development Auth (for local development only)
# Set to "true" to enable mock authentication when Clerk is not available
VITE_ENABLE_DEV_AUTH=true
VITE_DEV_USER_ID=user_31nfGdXgrOOiHNVWtJjf20VpuYm
VITE_DEV_USER_EMAIL=scott@scoti.co
```

### How It Works

The auth system works as follows:

1. **Production Mode**: Always uses real Clerk authentication
2. **Development Mode**: 
   - If `VITE_ENABLE_DEV_AUTH=true`, uses mock user with provided credentials
   - If `VITE_ENABLE_DEV_AUTH=false` or not set, uses real Clerk authentication
   - Requires both `VITE_DEV_USER_ID` and `VITE_DEV_USER_EMAIL` to be set

### Security Features

- ✅ **Environment Gated**: Only works in `development` mode
- ✅ **Explicit Opt-in**: Requires `VITE_ENABLE_DEV_AUTH=true` to be set
- ✅ **No Hardcoded Credentials**: All user data comes from environment variables
- ✅ **Production Safe**: Automatically disabled in production builds
- ✅ **Warning System**: Logs warnings if misconfigured

## Usage Examples

### Enable Development Auth
```bash
# .env
VITE_ENABLE_DEV_AUTH=true
VITE_DEV_USER_ID=user_your_test_user_id
VITE_DEV_USER_EMAIL=dev@example.com
```

### Disable Development Auth (Use Real Clerk)
```bash
# .env
VITE_ENABLE_DEV_AUTH=false
# or simply remove/comment out the VITE_ENABLE_DEV_AUTH line
```

### Production Deployment
```bash
# .env.production (or however you configure production)
# Do not include VITE_ENABLE_DEV_AUTH or set it to false
VITE_ENABLE_DEV_AUTH=false
```

## Implementation Details

The auth hook (`src/lib/auth.ts`) implements the following logic:

```typescript
const isDevAuthEnabled = () => {
  return (
    import.meta.env.MODE === "development" &&
    env.VITE_ENABLE_DEV_AUTH === "true"
  );
};
```

This ensures that:
- Mock auth only works in development mode
- Production builds will never use mock authentication
- Explicit opt-in is required via environment variable

## Migration from Previous Version

If you were previously using the hardcoded mock user:

1. Add the environment variables to your `.env` file
2. Set `VITE_ENABLE_DEV_AUTH=true` to maintain existing behavior
3. Customize `VITE_DEV_USER_ID` and `VITE_DEV_USER_EMAIL` as needed

## Troubleshooting

### Mock User Not Working
- Check that `VITE_ENABLE_DEV_AUTH=true` is set in your `.env`
- Ensure you're running in development mode (`vite dev`)
- Verify both `VITE_DEV_USER_ID` and `VITE_DEV_USER_EMAIL` are set
- Check browser console for warning messages

### Still Using Clerk in Development
This is the expected behavior when:
- `VITE_ENABLE_DEV_AUTH` is not set or set to `false`
- You're running in production mode
- Environment variables are missing

### Production Accidentally Using Mock
This should be impossible due to the environment mode check, but ensure:
- `VITE_ENABLE_DEV_AUTH` is not set to `"true"` in production
- Your production build process uses `NODE_ENV=production`