# Tenant Onboarding Runbook

> **Audience**: Developers / System Administrators
> **Last Updated**: December 2025
> **Estimated Time**: 30-45 minutes per tenant

This runbook documents the complete process for adding a new tenant to the landing page system.

---

## Prerequisites

Before starting, ensure you have:

- [ ] Admin access to Payload CMS
- [ ] Access to Vercel dashboard (for domain configuration)
- [ ] Access to DNS provider (or coordination with tenant's DNS admin)
- [ ] Tenant's custom domain name
- [ ] Contact email for the new tenant

---

## Tenant Information Checklist

Gather this information from the new tenant:

| Field                 | Example                              | Required |
| --------------------- | ------------------------------------ | -------- |
| Tenant Name           | "Acme Corp"                          | Yes      |
| Tenant Slug           | "acme-corp"                          | Yes      |
| Custom Domain         | "acme-landing.com"                   | Yes      |
| Primary Contact Email | "<admin@acme.com>"                   | Yes      |
| User Emails           | "<user1@acme.com>, <user2@acme.com>" | Optional |
| Logo/Branding Assets  | (URLs or files)                      | Optional |

---

## Step 1: Create Tenant in Payload CMS

### 1.1 Log in to Payload Admin

```
URL: https://your-payload-domain.com/admin
```

### 1.2 Create Tenant Record

1. Navigate to **Tenants** collection
2. Click **Create New**
3. Fill in fields:
   - **Name**: `Acme Corp`
   - **Slug**: `acme-corp` (lowercase, hyphenated)
4. Click **Save**
5. Note the **Tenant ID** (visible in URL after save)

### 1.3 Verify Tenant Created

```bash
# API verification
curl https://your-payload-domain.com/api/tenants?where[slug][equals]=acme-corp
```

Expected: JSON response with tenant data

---

## Step 2: Create Tenant Users

### 2.1 Create Admin User for Tenant

1. Navigate to **Users** collection
2. Click **Create New User**
3. Fill in fields:
   - **Email**: `admin@acme.com`
   - **Password**: Generate secure password (see credential management guide)
   - **Roles**: Select `user` (not admin)
   - **Tenants**: Select `Acme Corp`
4. Click **Save**

### 2.2 Create Additional Users (Optional)

Repeat 2.1 for each user email provided.

### 2.3 Share Credentials Securely

Follow the [Credential Management Guide](./credential-management.md):

1. Store credentials in password manager
2. Create secure sharing link
3. Send to tenant contact

---

## Step 3: Configure Custom Domain

### 3.1 Add Domain to Vercel

**Option A: Via Vercel Dashboard**

1. Go to Vercel Project → Settings → Domains
2. Click **Add Domain**
3. Enter: `acme-landing.com`
4. Click **Add**

**Option B: Via Vercel API**

```bash
curl -X POST "https://api.vercel.com/v10/projects/YOUR_PROJECT_ID/domains" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "acme-landing.com"
  }'
```

**Option C: Via Domain Settings UI (if implemented)**

1. Log in to main app settings
2. Navigate to Tenant Settings → Domain
3. Enter custom domain
4. Click Add Domain

### 3.2 Get DNS Configuration

Vercel will provide either:

**A Record (if apex domain):**

```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record (if subdomain):**

```
Type: CNAME
Name: www (or subdomain)
Value: cname.vercel-dns.com
```

### 3.3 Configure DNS

Send DNS instructions to tenant or configure if you have access:

```
DNS Configuration for acme-landing.com
--------------------------------------

Add this record to your DNS provider:

Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or default)

If using www subdomain, also add:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 3.4 Verify Domain

1. Wait for DNS propagation (5 minutes to 48 hours)
2. Check domain status in Vercel dashboard
3. Verify SSL certificate is issued

```bash
# Check DNS resolution
dig acme-landing.com

# Check HTTPS
curl -I https://acme-landing.com
```

---

## Step 4: Update Middleware Configuration

### 4.1 Add Domain Mapping

If using static configuration, update `src/proxy.ts`:

```typescript
const TENANT_DOMAINS: Record<string, string> = {
  'ceremoniacircle.org': 'ceremonia',
  'acme-landing.com': 'acme-corp', // Add new mapping
};
```

### 4.2 If Using Dynamic Configuration

The domain should be automatically loaded from Payload CMS Tenants collection if domain automation is implemented.

Verify by checking:

1. Tenant record has `customDomain` field set
2. Middleware queries tenant domains on startup

---

## Step 5: Create Initial Content

### 5.1 Create Welcome Page

1. Log in as tenant admin
2. Create new page:
   - **Title**: "Welcome to Acme Corp"
   - **Slug**: "home" or "welcome"
   - **Design System**: Untitled UI
3. Add sections:
   - Hero with company name
   - Features section (placeholder)
   - CTA section
4. Save and Publish

### 5.2 Verify Page Access

Test all URLs:

```bash
# Preview (should work immediately)
curl -I https://ceremoniacircle.org/preview/acme-corp/home

# Published (after publish)
curl -I https://ceremoniacircle.org/page/acme-corp/home

# Custom domain (after DNS + domain config)
curl -I https://acme-landing.com/lp/home
```

---

## Step 6: Handoff to Tenant

### 6.1 Send Welcome Package

Email to tenant with:

1. **Login Credentials** (via secure link)
2. **Admin URL**: `https://your-payload-domain.com/admin`
3. **Documentation Links**:
   - Adding New Pages guide
   - Editing Pages guide
   - Publishing Workflow guide
4. **Custom Domain URL**: `https://acme-landing.com/lp/`
5. **Support Contact Information**

### 6.2 Schedule Training (Optional)

If tenant requests training:

1. Schedule 60-minute session
2. Use training materials from `training-session-materials.md`
3. Record if requested

---

## Rollback Procedures

### If Tenant Needs to Be Removed

1. **Remove Domain from Vercel**
   - Vercel Dashboard → Domains → Remove

2. **Remove Middleware Mapping** (if static)
   - Remove entry from `TENANT_DOMAINS`

3. **Disable/Delete Users**
   - Payload Admin → Users → Select tenant users → Delete or disable

4. **Archive/Delete Tenant**
   - Payload Admin → Tenants → Select tenant → Delete
   - Consider archiving instead of deleting for audit trail

5. **Archive/Delete Pages**
   - Payload Admin → Pages → Filter by tenant → Delete

---

## Troubleshooting

### Domain Not Resolving

1. Check DNS propagation: `dig acme-landing.com`
2. Verify correct DNS records configured
3. Wait up to 48 hours for propagation
4. Check Vercel domain status for errors

### SSL Certificate Not Issuing

1. Verify domain DNS points to Vercel
2. Check Vercel dashboard for certificate status
3. May need to remove and re-add domain
4. Contact Vercel support if persists

### User Can't Log In

1. Verify user exists in Payload
2. Check tenant assignment
3. Reset password if needed
4. Verify Payload CMS is accessible

### Pages Not Showing on Custom Domain

1. Verify middleware mapping exists
2. Check tenant slug matches exactly
3. Verify page is published (not draft)
4. Check domain SSL/routing in Vercel

---

## Tenant Onboarding Checklist

Use this checklist for each new tenant:

### Setup

- [ ] Tenant information collected
- [ ] Tenant created in Payload CMS
- [ ] Tenant ID noted: \_\_\_\_\_\_\_\_\_\_
- [ ] Admin user created
- [ ] Additional users created (if any)
- [ ] Credentials stored in password manager

### Domain

- [ ] Domain added to Vercel
- [ ] DNS instructions sent to tenant
- [ ] DNS configured by tenant
- [ ] DNS propagated (verified)
- [ ] SSL certificate issued
- [ ] Middleware mapping updated (if static)

### Content

- [ ] Welcome page created
- [ ] Page published
- [ ] Custom domain URL verified working

### Handoff

- [ ] Credentials shared securely
- [ ] Documentation links sent
- [ ] Support contact provided
- [ ] Training scheduled (if requested)
- [ ] Welcome email sent

### Sign-Off

- [ ] Tenant confirms access
- [ ] Tenant confirms domain works
- [ ] Onboarding complete date: \_\_\_\_\_\_\_\_\_\_

---

## Time Estimates

| Task                           | Estimated Time   |
| ------------------------------ | ---------------- |
| Create tenant & users          | 10 minutes       |
| Configure domain (Vercel)      | 5 minutes        |
| DNS propagation                | 5 min - 48 hours |
| Create initial content         | 10 minutes       |
| Prepare handoff materials      | 10 minutes       |
| **Total (excluding DNS wait)** | **35 minutes**   |

---

## Appendix: API Reference

### Create Tenant via API

```bash
curl -X POST https://your-payload-domain.com/api/tenants \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme-corp"
  }'
```

### Create User via API

```bash
curl -X POST https://your-payload-domain.com/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "SecurePassword123!",
    "roles": ["user"],
    "tenants": [{"tenant": "TENANT_ID"}]
  }'
```

### List Tenants

```bash
curl https://your-payload-domain.com/api/tenants \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

_This runbook should be updated as the system evolves. Last reviewed: December 2025_
