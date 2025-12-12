# Domain Management Fix Action Plan

**Date**: 2025-12-12
**Issue**: Tenant settings showing wrong domain + missing Vercel API token error
**Affected Tenant**: Ceremonia (`live.ceremoniacircle.org`)

---

## Problem Summary

### Issue 1: Wrong Domain Display

- **Observed**: Tenant settings page shows `ceremoniacircle.org`
- **Expected**: Should show `live.ceremoniacircle.org`
- **Impact**: User confusion about which domain is configured

### Issue 2: Vercel API Token Missing

- **Error**: "VERCEL_API_TOKEN is required" when clicking "Verify Domain"
- **Impact**: Domain verification automation doesn't work
- **Root Cause**: Missing environment variables in production deployment

---

## Root Cause Analysis

### 1. Wrong Domain Value in Database

The tenant record in Payload CMS likely has:

```json
{
  "domain": "ceremoniacircle.org",
  "domainStatus": null
}
```

But it should have:

```json
{
  "domain": "live.ceremoniacircle.org",
  "domainStatus": "verified" or "pending_verification"
}
```

**Why this happened**:

- Initial tenant setup may have used wrong domain value
- Domain was likely added manually to Payload CMS instead of via the domain automation flow

### 2. Missing Environment Variables

The VercelDomain module requires these environment variables:

**Required** (checked in `/Users/austinmao/Documents/GitHub/lobe-builder/src/server/modules/VercelDomain/index.ts`):

```typescript
VERCEL_API_TOKEN; // Line 87: throws error if missing
VERCEL_PROJECT_ID; // Line 91: throws error if missing
```

**Optional**:

```typescript
VERCEL_TEAM_ID; // Line 97: used for team accounts
```

**Where they're defined**:

- Config: `/Users/austinmao/Documents/GitHub/lobe-builder/src/envs/vercel.ts`
- Not in `.env.example` (needs to be added)

---

## Architecture Overview

### Domain Automation Flow

```
User clicks "Verify Domain"
    ↓
DomainSettings.tsx (line 157)
    ↓
tRPC mutation: domain.verify
    ↓
src/server/routers/lambda/domain.ts (line 266)
    ↓
VercelDomain.verifyDomain() (line 199)
    ↓ [FAILS HERE]
Constructor checks VERCEL_API_TOKEN (line 87)
    ↓
Throws: "VERCEL_API_TOKEN is required"
```

### Tenant Data Flow

```
TenantSettings component
    ↓
tRPC query: domain.getTenant (line 142)
    ↓
TenantRepository.findBySlug() (line 109)
    ↓
Payload CMS REST API: GET /api/tenants?where[slug][equals]=ceremonia
    ↓
Returns tenant data including domain field
```

### Middleware Domain Routing

The middleware (`/Users/austinmao/Documents/GitHub/lobe-builder/src/proxy.ts`) uses:

1. **Static fallback domains** (line 39-41):

```typescript
const FALLBACK_TENANT_DOMAINS: Record<string, string> = {
  'live.ceremoniacircle.org': 'ceremonia',
};
```

2. **Dynamic domains from database** (line 122):

```typescript
const dbDomains = await getTenantDomains();
```

3. **Merged domains** (line 125):

```typescript
const TENANT_DOMAINS = { ...FALLBACK_TENANT_DOMAINS, ...dbDomains };
```

**Current routing works** because `live.ceremoniacircle.org` is in the fallback config, but it won't work dynamically once we fix the database.

---

## Solution: Two-Part Fix

### Part 1: Fix Environment Variables (Production Deployment)

Add these environment variables to Vercel dashboard:

#### Required Variables

1. **VERCEL_API_TOKEN**
   - **Where to get**: <https://vercel.com/account/tokens>
   - **Steps**:
     1. Log into Vercel dashboard
     2. Go to Settings → Tokens
     3. Click "Create Token"
     4. Name: "lobe-builder-domain-automation"
     5. Scope: Full Account (or select specific teams)
     6. Expiration: No expiration (or set to 1 year)
     7. Copy token (shown only once!)
   - **Add to Vercel**:
     1. Go to project → Settings → Environment Variables
     2. Name: `VERCEL_API_TOKEN`
     3. Value: `<paste token>`
     4. Scope: Production, Preview, Development
     5. Click Save

2. **VERCEL_PROJECT_ID**
   - **Where to get**: Vercel project URL or project settings
   - **Steps**:
     1. Go to your Vercel project
     2. URL format: `https://vercel.com/<team>/<project>`
     3. OR go to Settings → General
     4. Copy "Project ID" (format: `prj_xxxxxxxxxxxx`)
   - **Add to Vercel**:
     1. Go to project → Settings → Environment Variables
     2. Name: `VERCEL_PROJECT_ID`
     3. Value: `<project ID>`
     4. Scope: Production, Preview, Development
     5. Click Save

3. **VERCEL_TEAM_ID** (optional, only if using Vercel team account)
   - **Where to get**: Team settings
   - **Steps**:
     1. Go to Vercel dashboard
     2. If you see a team dropdown in top-left, you're using teams
     3. Go to Settings → General
     4. Copy "Team ID" (format: `team_xxxxxxxxxxxx`)
   - **Add to Vercel**: Same process as above

4. **PAYLOAD_API_URL**
   - **Value for production**: URL where Payload CMS is deployed
   - **Example**: `https://payload.yourdomain.com`
   - **Add to Vercel**: Same process as above
   - **Note**: TenantRepository requires this to fetch tenant data (line 68-70)

#### After Adding Variables

1. Redeploy the application:

   ```bash
   # Trigger new deployment
   git commit --allow-empty -m "chore: trigger redeploy for env vars"
   git push
   ```

2. Or manually redeploy in Vercel dashboard:
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

### Part 2: Fix Tenant Domain Value

You have three options to fix the domain value:

#### Option A: Update via Payload CMS Admin UI (Recommended)

1. **Access Payload Admin**:

   ```
   URL: http://localhost:3011/admin (local)
   URL: https://payload.yourdomain.com/admin (production)
   ```

2. **Navigate to Tenants**:
   - Click "Tenants" in sidebar
   - Find "Ceremonia" tenant
   - Click to edit

3. **Update Domain Field**:
   - Change `domain` from `ceremoniacircle.org` to `live.ceremoniacircle.org`
   - Set `domainStatus` to `verified` (if DNS is already configured)
   - OR set to `pending_verification` (if DNS not configured yet)
   - Click Save

#### Option B: Update via Payload REST API

```bash
# 1. Get tenant ID
curl "http://localhost:3011/api/tenants?where[slug][equals]=ceremonia&limit=1"

# 2. Update tenant (replace TENANT_ID with actual ID from step 1)
curl -X PATCH "http://localhost:3011/api/tenants/TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "live.ceremoniacircle.org",
    "domainStatus": "verified"
  }'
```

#### Option C: Update via Domain Settings UI (After fixing env vars)

1. Log into the main app
2. Go to Settings → Tenant Settings
3. Click "Remove Domain" (removes wrong domain)
4. Click "Add Custom Domain"
5. Enter: `live.ceremoniacircle.org`
6. This will:
   - Call Vercel API to add domain
   - Update Payload CMS with correct domain
   - Set status to `pending_verification`
7. Configure DNS (if not already done)
8. Click "Verify Domain"

---

## Verification Steps

### 1. Verify Environment Variables

**Local Development**:

```bash
# Check .env.local has the vars
grep -E "VERCEL_API_TOKEN|VERCEL_PROJECT_ID|PAYLOAD_API_URL" .env.local
```

**Production**:

- Go to Vercel project → Settings → Environment Variables
- Confirm all 3-4 variables are present

### 2. Verify Tenant Data

**Via Payload Admin**:

1. Log into Payload Admin
2. Go to Tenants → Ceremonia
3. Confirm:
   - Domain: `live.ceremoniacircle.org`
   - Domain Status: `verified` or `pending_verification`

**Via API**:

```bash
curl "http://localhost:3011/api/tenants?where[slug][equals]=ceremonia" | jq '.docs[0] | {domain, domainStatus}'
```

Expected output:

```json
{
  "domain": "live.ceremoniacircle.org",
  "domainStatus": "verified"
}
```

### 3. Verify Domain Automation Works

**Test "Verify Domain" Button**:

1. Go to Settings → Tenant Settings
2. Click "Verify Domain"
3. Should NOT show "VERCEL_API_TOKEN is required"
4. Should either:
   - Show "Domain Verified" (if DNS configured and verified)
   - Show pending verification records (if DNS not configured)

**Check Network Tab**:

1. Open browser DevTools → Network tab
2. Click "Verify Domain"
3. Check tRPC request to `domain.verify`
4. Response should NOT have error about missing token

### 4. Verify Middleware Routing

**Test Custom Domain URL**:

```bash
# Should return 200 OK
curl -I https://live.ceremoniacircle.org/

# Should return 200 OK
curl -I https://live.ceremoniacircle.org/lp/home
```

**Check Middleware Logs** (local dev):

```bash
DEBUG=middleware:* npm run dev
# Visit http://localhost:3010 and watch logs
# Should see tenant domain mapping
```

---

## Rollback Plan

If anything goes wrong:

### Rollback Environment Variables

1. Go to Vercel project → Settings → Environment Variables
2. Delete the newly added variables
3. Redeploy

### Rollback Tenant Domain

1. Log into Payload Admin
2. Go to Tenants → Ceremonia
3. Revert domain to previous value
4. Save

### Rollback Code Changes

```bash
# If you made any code changes
git revert <commit-hash>
git push
```

---

## Post-Fix Validation

After completing both fixes, validate:

### Checklist

- [ ] **Env vars added to Vercel**:
  - `VERCEL_API_TOKEN`
  - `VERCEL_PROJECT_ID`
  - `VERCEL_TEAM_ID` (if team account)
  - `PAYLOAD_API_URL`

- [ ] **Application redeployed** after adding env vars

- [ ] **Tenant domain corrected** in Payload CMS:
  - Domain: `live.ceremoniacircle.org`
  - Status: `verified` or `pending_verification`

- [ ] **Domain verification works**:
  - No "VERCEL_API_TOKEN is required" error
  - Returns verification status

- [ ] **Custom domain routes correctly**:
  - `https://live.ceremoniacircle.org/` → works
  - `https://live.ceremoniacircle.org/lp/home` → works

- [ ] **Tenant settings UI shows correct domain**:
  - Displays: `live.ceremoniacircle.org`
  - Shows correct status badge

---

## Future Improvements

### 1. Add to .env.example

Update `/Users/austinmao/Documents/GitHub/lobe-builder/.env.example`:

```bash
# #######################################
# ########## Vercel Domain API ##########
# #######################################

# Vercel API token for automated domain management
# Get from: https://vercel.com/account/tokens
# VERCEL_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel project ID for domain configuration
# Get from: Project Settings → General → Project ID
# VERCEL_PROJECT_ID=prj_xxxxxxxxxxxx

# Vercel team ID (optional, only for team accounts)
# Get from: Team Settings → General → Team ID
# VERCEL_TEAM_ID=team_xxxxxxxxxxxx

# #######################################
# ########## Payload CMS API ############
# #######################################

# Payload CMS API URL for tenant management
# Local: http://localhost:3011
# Production: https://payload.yourdomain.com
# PAYLOAD_API_URL=http://localhost:3011
```

### 2. Add Validation to Domain Input

Prevent users from entering wrong domain formats:

**File**: `/Users/austinmao/Documents/GitHub/lobe-builder/src/features/TenantSettings/DomainSettings.tsx`

Add validation hint:

```typescript
// Around line 304
<Input
  placeholder={t('tenant.domain.placeholder', 'live.example.com')}
  addonBefore="https://"
  // ... existing props
/>
```

### 3. Add Better Error Messages

**File**: `/Users/austinmao/Documents/GitHub/lobe-builder/src/server/modules/VercelDomain/index.ts`

Improve error messages:

```typescript
// Line 87-89
if (!vercelEnv.VERCEL_API_TOKEN) {
  throw new Error(
    'VERCEL_API_TOKEN is required. Generate one at https://vercel.com/account/tokens ' +
      'and add it to your environment variables.',
  );
}
```

### 4. Add Environment Variable Check on Startup

Create a startup validation script:

```typescript
// src/utils/validateEnv.ts
export function validateDomainAutomation() {
  const required = ['VERCEL_API_TOKEN', 'VERCEL_PROJECT_ID', 'PAYLOAD_API_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn('⚠️  Domain automation disabled. Missing env vars: ' + missing.join(', '));
    return false;
  }

  console.log('✅ Domain automation enabled');
  return true;
}
```

---

## Documentation Updates Needed

1. **Update tenant onboarding runbook**:
   - Add step to verify env vars before onboarding
   - Update domain configuration section with new UI flow

2. **Create env vars setup guide**:
   - Document how to get each token/ID
   - Add screenshots from Vercel dashboard

3. **Update DNS configuration guide**:
   - Reference correct domain format
   - Add troubleshooting for wrong domain value

---

## Contact Information

If you encounter issues during this fix:

**Environment Variable Issues**:

- Vercel Support: <https://vercel.com/support>
- Check: <https://vercel.com/docs/projects/environment-variables>

**Payload CMS Issues**:

- Payload Docs: <https://payloadcms.com/docs>
- Check Payload logs for API errors

**DNS Issues**:

- DNS Checker: <https://dnschecker.org>
- Refer to: `/Users/austinmao/Documents/GitHub/lobe-builder/docs/ceremonia/dns-configuration-guide.md`

---

## Summary

**Immediate Actions**:

1. Add environment variables to Vercel (5 min)
2. Redeploy application (5 min)
3. Fix tenant domain value in Payload CMS (2 min)
4. Verify domain automation works (5 min)

**Total Time**: \~20 minutes

**Risk**: Low (changes are configuration-only, easily reversible)

**Impact**: Fixes domain management UI and enables automated domain verification
