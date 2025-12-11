# DNS Configuration Guide for live.ceremoniacircle.org

## Overview

This guide will help you configure your DNS settings to point `live.ceremoniacircle.org` to Vercel's hosting platform. This is a one-time setup that typically takes 5-10 minutes to configure and up to 48 hours to fully propagate across the internet.

**What you'll need:**

- Access to your DNS provider (where ceremoniacircle.org is registered)
- 5-10 minutes to complete the configuration

**What we're doing:**

- Adding a CNAME record that points `live.ceremoniacircle.org` to Vercel's servers

---

## Step-by-Step Configuration

### Step 1: Log into Your DNS Provider

Access the DNS management panel for `ceremoniacircle.org`. This is typically found in:

- Your domain registrar (GoDaddy, Namecheap, etc.)
- Your DNS provider (Cloudflare, Route53, etc.)

### Step 2: Add a CNAME Record

Add a new DNS record with these **exact values**:

| Field            | Value                  |
| ---------------- | ---------------------- |
| **Type**         | CNAME                  |
| **Name**         | `live`                 |
| **Target/Value** | `cname.vercel-dns.com` |
| **TTL**          | 3600 (or Auto)         |

**Important Notes:**

- Some DNS providers may show the full domain (`live.ceremoniacircle.org`) in the Name field - that's fine
- Do NOT include a trailing dot after `cname.vercel-dns.com` unless your provider specifically requires it
- The Name field should be `live` (not `www` or `@`)

---

## Provider-Specific Instructions

### GoDaddy

1. Log into GoDaddy and go to **My Products**
2. Click **DNS** next to ceremoniacircle.org
3. Click **Add** in the Records section
4. Select **CNAME** from the Type dropdown
5. Enter `live` in the Name field
6. Enter `cname.vercel-dns.com` in the Value field
7. Click **Save**

### Namecheap

1. Log into Namecheap and go to **Domain List**
2. Click **Manage** next to ceremoniacircle.org
3. Go to **Advanced DNS** tab
4. Click **Add New Record**
5. Select **CNAME Record** from the Type dropdown
6. Enter `live` in the Host field
7. Enter `cname.vercel-dns.com` in the Target field
8. Click the checkmark to save

### Cloudflare

1. Log into Cloudflare and select ceremoniacircle.org
2. Go to **DNS** in the left sidebar
3. Click **Add record**
4. Select **CNAME** from the Type dropdown
5. Enter `live` in the Name field
6. Enter `cname.vercel-dns.com` in the Target field
7. Set Proxy status to **DNS only** (gray cloud)
8. Click **Save**

**Important for Cloudflare:** Make sure the cloud icon is GRAY (DNS only), not orange (Proxied). The proxied mode can interfere with Vercel's SSL certificate provisioning.

### Other Providers

If your DNS provider isn't listed above, look for:

- DNS Management
- DNS Records
- Add Record or Add DNS Entry

Then follow the general instructions in Step 2.

---

## Verification

### Immediate Verification (After Configuration)

After you've added the CNAME record, verify it was saved correctly by checking your DNS provider's record list. You should see:

```
Type: CNAME
Name: live (or live.ceremoniacircle.org)
Target: cname.vercel-dns.com
```

### DNS Propagation Check (After 10-30 Minutes)

DNS changes take time to propagate. After 10-30 minutes, you can check if the changes are live:

#### Option 1: Online DNS Checker (Easiest)

Visit: <https://dnschecker.org/#CNAME/live.ceremoniacircle.org>

This will show you DNS propagation status around the world.

#### Option 2: Command Line

**On Mac/Linux:**

```bash
dig live.ceremoniacircle.org CNAME
```

**On Windows (PowerShell):**

```powershell
nslookup -type=CNAME live.ceremoniacircle.org
```

**What to look for:**
You should see `cname.vercel-dns.com` in the response. For example:

```
live.ceremoniacircle.org.  3600  IN  CNAME  cname.vercel-dns.com.
```

If you see this, the DNS is configured correctly!

---

## Timeline

- **Configuration**: 5-10 minutes
- **Initial Propagation**: 10-30 minutes (some DNS servers will see the change)
- **Full Propagation**: Up to 48 hours (all DNS servers worldwide)

Most users will be able to access the site within 1-2 hours, but it can take up to 48 hours for everyone globally.

---

## Troubleshooting

### "The record already exists"

If you see this error, there may already be a CNAME or A record for `live`. You'll need to:

1. Find the existing `live` record
2. Delete it or modify it to point to `cname.vercel-dns.com`

### "Cannot add CNAME record"

Some DNS providers have restrictions:

- Ensure there's no A record for `live` (delete it first)
- Ensure there's no other CNAME for `live`
- Try using the full domain `live.ceremoniacircle.org` in the Name field

### DNS check shows old/wrong value

This is normal during propagation:

- Wait 10-30 minutes and check again
- Some DNS servers update faster than others
- Use <https://dnschecker.org> to see propagation progress

### Still not working after 48 hours

Contact your DNS provider's support or reach out to the Ceremonia technical team with:

- Your DNS provider name
- Screenshot of your DNS records
- Results from the verification commands above

---

## Verification Checklist

Before considering this task complete, verify:

- [ ] CNAME record added to DNS provider
- [ ] Record shows: Type=CNAME, Name=live, Target=cname.vercel-dns.com
- [ ] Initial verification command shows correct target (after 10-30 min)
- [ ] No error messages in DNS provider dashboard

---

## After Configuration

Once DNS propagation is complete:

1. Visit <https://live.ceremoniacircle.org> to confirm it loads
2. Check that the site has a valid SSL certificate (padlock icon in browser)
3. Test on multiple devices/networks to confirm global propagation

If you encounter any issues or have questions, please contact the technical team with the verification results above.

---

## Quick Reference

**Domain**: `live.ceremoniacircle.org`
**Record Type**: CNAME
**Name/Host**: `live`
**Target/Value**: `cname.vercel-dns.com`
**TTL**: 3600 (or Auto)

**Verification Command (Mac/Linux)**:

```bash
dig live.ceremoniacircle.org CNAME
```

**Verification Command (Windows)**:

```powershell
nslookup -type=CNAME live.ceremoniacircle.org
```
