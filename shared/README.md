# @songcraft/shared

Shared utilities, types, and configurations for the Songcraft monorepo.

## 🆔 Short ID Generation

This package provides human-readable, short ID generation using [nanoid](https://github.com/ai/nanoid) for better user experience.

### Basic Usage

```typescript
import {
  generateShortId,
  generateSongId,
  generateUserId,
  generateCollaborationId,
} from "@songcraft/shared";

// Generate a basic 6-character ID
const shortId = generateShortId(); // e.g., "aB3x9K"

// Generate prefixed IDs for different entity types
const songId = generateSongId(); // e.g., "song-aB3x9K"
const userId = generateUserId(); // e.g., "user-xY7mN2"
const collabId = generateCollaborationId(); // e.g., "collab-pQ9vR5"
```

### Custom Prefixes

```typescript
import { generateHumanReadableId } from "@songcraft/shared";

// Generate custom prefixed IDs
const playlistId = generateHumanReadableId("playlist"); // "playlist-kL8wZ1"
const albumId = generateHumanReadableId("album"); // "album-mN9xR2"
```

### ID Validation

```typescript
import {
  isValidHumanReadableId,
  parseHumanReadableId,
  extractPrefix,
} from "@songcraft/shared";

// Validate ID format
const isValid = isValidHumanReadableId("song-aB3x9K"); // true
const isInvalid = isValidHumanReadableId("invalid"); // false

// Parse ID components
const parsed = parseHumanReadableId("song-aB3x9K");
// Returns: { prefix: "song", shortId: "aB3x9K" }

// Extract just the prefix
const prefix = extractPrefix("song-aB3x9K"); // "song"
```

### ID Format

All generated IDs follow this pattern:

- **Format**: `{prefix}-{6-character-alphanumeric}`
- **Examples**:
  - `song-aB3x9K`
  - `user-xY7mN2`
  - `collab-pQ9vR5`
  - `playlist-kL8wZ1`

### Benefits

1. **Human Readable** - Easy to identify entity types
2. **Short** - Only 6 characters after the prefix
3. **Unique** - Uses nanoid for collision resistance
4. **URL Friendly** - Safe for URLs and routing
5. **Type Safe** - Full TypeScript support

## 🏗️ Building

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

## 📦 Installation

This package is automatically available to all workspace packages via:

```typescript
import { ... } from '@songcraft/shared';
```

No additional installation required in workspace packages.

## Deployment

From your project root
export LINODE_HOST=192.155.94.5
./scripts/deploy-linode-dev.sh
