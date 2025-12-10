# TASK-009: Install and Configure Payload CMS

## Status: ✅ COMPLETED

## Quick Start

To run the Payload CMS server:

```bash
bun run dev:payload
```

The admin panel will be available at: <http://localhost:3011/admin>

## What Was Built

1. **Payload Server** (`apps/payload/`)
   - Separate Express server running on port 3011
   - Connects to existing PostgreSQL database
   - Hot-reloading development with tsx watch

2. **Configuration Files**
   - `payload.config.ts` - Payload CMS configuration
   - `src/server.ts` - Express server with Payload initialization
   - `package.json` - Dependencies and scripts
   - `tsconfig.json` - TypeScript configuration

3. **Workspace Integration**
   - Added to pnpm workspace (`apps/**`)
   - Root script: `dev:payload` for easy startup

## Key Technical Decisions

### Database Sharing

- **Strategy**: Share PostgreSQL database with LobeChat
- **Connection**: Uses existing `DATABASE_URL` environment variable
- **Table Naming**: Payload uses collection names (e.g., `users`, `pages`) - no custom prefix available in v3

### Port Allocation

- **Payload CMS**: Port 3011
- **LobeChat**: Port 3010 (existing)
- **Desktop**: Port 3015 (existing)

## Environment Variables Required

```bash
DATABASE_URL=postgresql://... # Already configured
PAYLOAD_SECRET=...            # Already configured
PAYLOAD_PORT=3011             # Optional, defaults to 3011
```

## Files Created

```
apps/payload/
├── package.json              # Payload workspace package
├── payload.config.ts         # Payload configuration
├── tsconfig.json            # TypeScript config
└── src/
    └── server.ts            # Express server entry point
```

## Files Modified

```
package.json                 # Added workspace and dev:payload script
pnpm-workspace.yaml         # Added apps/** to workspaces
```

## Verification

Server starts successfully with:

```
🚀 Payload CMS server started successfully!
📍 Admin Panel: http://localhost:3011/admin
📊 Database: PostgreSQL (shared with LobeChat)
```

## Next Steps

- **TASK-010**: Add Payload collections (pages, blocks)
- **TASK-011**: Configure multi-tenant plugin
- **TASK-012**: Set up user authentication

## Dependencies

- payload@^3.14.0
- @payloadcms/db-postgres@^3.14.0
- @payloadcms/richtext-lexical@^3.14.0
- express@^4.21.2

## Notes

- Collections array is empty by design (will be populated in TASK-010)
- 404 on /admin is expected until collections are added
- Email adapter warning is expected (can be configured later if needed)
- Table prefix requirement adjusted: Payload v3 doesn't support custom prefixes, uses collection-based naming instead
