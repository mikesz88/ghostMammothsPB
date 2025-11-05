<!-- f588bc34-d9bf-412b-801f-9a5ab4ae8bdb f3c4eb04-7463-406e-b969-b86a2feccc62 -->
# Development Database Setup Plan

## Overview

Create a development database environment separate from production, with two implementation approaches and a one-time data export from the current production Supabase instance.

## Approach A: Separate Supabase Project (Primary)

### 1. Export Production Data

Create a script to export all current data from production Supabase:

**New file: `scripts/export-production-data.ts`**

- Connect to current Supabase instance using existing credentials
- Export data from all tables:
- `users` (with auth users)
- `events`
- `queue_entries`
- `court_assignments`
- `membership_tiers`
- `user_memberships`
- `payments`
- `email_logs`
- Save as JSON files in `scripts/data-exports/` directory
- Include timestamp in filenames for versioning

### 2. Create Import Script

**New file: `scripts/import-dev-data.ts`**

- Read exported JSON files
- Insert data into new Supabase project
- Handle foreign key relationships in correct order
- Skip or anonymize sensitive data (optional)

### 3. Environment Configuration

**New file: `.env.development.local`**

- Add new Supabase project credentials:
- `NEXT_PUBLIC_SUPABASE_URL_DEV`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV`
- `SUPABASE_SERVICE_ROLE_KEY_DEV`
- Keep existing `.env.local` for production

**Update: `lib/supabase/client.ts` and `lib/supabase/server.ts`**

- Add environment detection logic
- Use dev credentials when `NODE_ENV=development`
- Use production credentials when `NODE_ENV=production`

### 4. Setup Instructions Document

**New file: `docs/dev-database-setup.md`**

- Step-by-step guide for creating new Supabase project
- Instructions to run all migration scripts (01-16) in new project
- Commands to export and import data
- How to switch between dev and production environments

## Approach B: Local Docker Supabase (Fallback)

### 1. Supabase CLI Setup

**New file: `docker-compose.yml`**

- Configure local Supabase stack using official Supabase CLI
- Postgres database
- Supabase Auth
- Supabase Realtime
- PostgREST API
- Storage (optional)

**New file: `supabase/.env.local`**

- Local database credentials
- JWT secrets
- Service role key

### 2. Initialize Local Supabase

**New file: `scripts/init-local-supabase.sh`**

- Install Supabase CLI if not present
- Run `supabase init` to create local config
- Run `supabase start` to start Docker containers
- Apply all migration scripts from `scripts/` directory
- Import exported production data

### 3. Environment Switching

**Update: `package.json`**

- Add scripts:
- `"dev:local"` - Start Next.js with local Supabase
- `"dev:remote"` - Start Next.js with remote dev Supabase
- `"dev:prod"` - Start Next.js with production Supabase (read-only)
- `"supabase:start"` - Start local Supabase containers
- `"supabase:stop"` - Stop local Supabase containers
- `"supabase:reset"` - Reset local database

### 4. Local Configuration

**New file: `.env.local.docker`**

- Local Supabase URLs (typically `http://localhost:54321`)
- Local anon and service role keys
- Disable Stripe webhooks for local dev
- Use console email logging instead of sending

## Data Export Details

### Tables to Export (in order):

1. `users` - All user accounts
2. `membership_tiers` - Membership configuration
3. `events` - All events (past and future)
4. `queue_entries` - Queue history
5. `court_assignments` - Assignment history
6. `user_memberships` - User subscription data
7. `payments` - Payment records
8. `email_logs` - Email history

### Export Script Features:

- Batch processing for large tables
- Progress indicators
- Error handling and retry logic
- Data validation before export
- Option to exclude test data
- Option to anonymize user emails/phones

## Authentication Considerations

Both approaches will use Supabase Auth:

- **Approach A**: New Supabase project has separate auth users
- **Approach B**: Local Supabase has separate auth instance

After importing data, you'll need to:

1. Create auth users in the new environment
2. Link them to imported `users` table records
3. Or provide a script to create test accounts with known passwords

## Files to Create/Modify

### New Files:

1. `scripts/export-production-data.ts` - Export script
2. `scripts/import-dev-data.ts` - Import script  
3. `scripts/data-exports/.gitkeep` - Export directory
4. `.env.development.local` - Dev environment variables
5. `docs/dev-database-setup.md` - Setup documentation
6. `docker-compose.yml` - Docker config (Approach B)
7. `supabase/.env.local` - Local Supabase config (Approach B)
8. `scripts/init-local-supabase.sh` - Local setup script (Approach B)
9. `.env.local.docker` - Docker environment (Approach B)

### Modified Files:

1. `lib/supabase/client.ts` - Add environment detection
2. `lib/supabase/server.ts` - Add environment detection
3. `package.json` - Add dev scripts
4. `.gitignore` - Ignore data exports and local env files

## Next Steps After Plan Approval

1. Create export script and run it to backup current production data
2. Wait for client decision on Approach A vs B
3. If Approach A: Set up new Supabase project and import data
4. If Approach B: Set up local Docker environment and import data
5. Test authentication and data access in dev environment
6. Document any Stripe test mode configuration needed

### To-dos

- [ ] Create export-production-data.ts script to backup all current Supabase data
- [ ] Create import-dev-data.ts script to load data into new environment
- [ ] Set up environment detection in Supabase client/server files
- [ ] Create documentation for setting up separate Supabase project
- [ ] Create Docker Compose and local Supabase setup scripts
- [ ] Add npm scripts for different development modes
- [ ] Test data import and verify all relationships work correctly