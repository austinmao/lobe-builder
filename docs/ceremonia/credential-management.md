# Credential Management - Admin Reference

> **Audience**: System administrators
> **Last Updated**: December 2025
> **Classification**: Internal use only

This document provides the procedure for creating and securely sharing Ceremonia team credentials.

---

## Credential Requirements

### Password Policy

All Payload CMS passwords must meet these requirements:

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### User Roles

| Role      | Permissions                             |
| --------- | --------------------------------------- |
| **admin** | Full access to all tenants and settings |
| **user**  | Access only to assigned tenant(s)       |

For Ceremonia team members, use the **user** role with Ceremonia tenant assignment.

---

## Creating Credentials

### Option A: Via Payload Admin UI

1. Log in to Payload admin as an admin user
2. Navigate to **Users** collection
3. Click **Create New User**
4. Fill in:
   - **Email**: `username@ceremoniacircle.org`
   - **Password**: Generate a secure password
   - **Roles**: Select `user`
   - **Tenants**: Select `Ceremonia`
5. Click **Save**

### Option B: Via Payload API

```bash
curl -X POST https://your-payload-domain.com/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@ceremoniacircle.org",
    "password": "SecurePassword123!",
    "roles": ["user"],
    "tenants": [{"tenant": "CEREMONIA_TENANT_ID"}]
  }'
```

---

## Secure Password Generation

### Using Password Manager

1. Open 1Password, Bitwarden, or similar
2. Use the password generator
3. Settings:
   - Length: 16+ characters
   - Include: uppercase, lowercase, numbers, symbols
4. Save the generated password

### Using Command Line

```bash
# macOS/Linux
openssl rand -base64 16 | tr -d '\n' && echo

# Or using /dev/urandom
head -c 16 /dev/urandom | base64
```

---

## Secure Credential Sharing

### Approved Methods

| Method                     | Security Level | Recommended For      |
| -------------------------- | -------------- | -------------------- |
| **1Password Shared Vault** | High           | Team accounts        |
| **Bitwarden Send**         | High           | One-time sharing     |
| **1Password Secure Link**  | High           | Individual sharing   |
| **Encrypted Email (PGP)**  | Medium         | Technical recipients |

### NOT Approved Methods

- Plain text email
- Slack/Teams messages
- SMS/text messages
- Shared documents (Google Docs, etc.)
- Screenshots

---

## 1Password Sharing Procedure

### Create a Secure Note

1. Open 1Password
2. Create new **Login** item or **Secure Note**
3. Fill in:
   - **Title**: `Ceremonia Payload CMS - [User Name]`
   - **Website**: `https://your-payload-domain.com/admin`
   - **Username**: User's email
   - **Password**: Generated password
4. Save the item

### Share via Secure Link

1. Select the item
2. Click **Share** → **Get a shareable link**
3. Set options:
   - **Expires after**: 7 days (or less)
   - **Available to**: Anyone with the link
   - **Can be viewed**: 1 time (recommended)
4. Copy the link
5. Send via secure channel (direct message, encrypted email)

### Share via Shared Vault (Team)

1. Create or access a shared vault (e.g., "Ceremonia Team")
2. Move the credential item to the shared vault
3. Ensure recipient has access to the vault
4. Notify recipient that credentials are available

---

## Bitwarden Sharing Procedure

### Using Bitwarden Send

1. Open Bitwarden
2. Go to **Send** → **Create New Send**
3. Select **Text** type
4. Enter credential information:
   ```
   Ceremonia Payload CMS
   URL: https://your-payload-domain.com/admin
   Email: user@ceremoniacircle.org
   Password: [password here]
   ```
5. Set options:
   - **Deletion Date**: 7 days
   - **Expiration Date**: 24 hours
   - **Maximum Access Count**: 1
   - **Password** (optional): Add for extra security
6. Click **Save**
7. Copy the Send link
8. Share via secure channel

---

## Credential Handoff Checklist

Use this checklist when sharing credentials:

### Before Sharing

- [ ] User account created in Payload
- [ ] User assigned to correct tenant (Ceremonia)
- [ ] User has correct role (user, not admin)
- [ ] Password meets complexity requirements
- [ ] Password stored in password manager

### Sharing

- [ ] Using approved sharing method (1Password/Bitwarden)
- [ ] Link has expiration set (7 days max)
- [ ] Link has view limit set (1-2 views)
- [ ] Shared via secure channel (not plain email)

### After Sharing

- [ ] Recipient confirmed receipt
- [ ] Recipient confirmed successful login
- [ ] Sharing link expired/deleted
- [ ] Documented in credential log (if maintained)

---

## First Login Instructions for Recipients

Include these instructions when sharing credentials:

```
CEREMONIA PAYLOAD CMS - LOGIN INSTRUCTIONS

1. Click this secure link to retrieve your credentials:
   [1Password/Bitwarden link here]

   NOTE: This link expires in [X days] and can only be viewed [X times].

2. Open your browser and go to:
   https://your-payload-domain.com/admin

3. Enter your credentials:
   - Email: [as provided]
   - Password: [from secure link]

4. Click "Log In"

5. IMPORTANT: After your first login, we recommend:
   - Save your credentials in your own password manager
   - Verify you can access the Pages collection

If you have any issues logging in, contact [admin contact info].
```

---

## Credential Rotation

### When to Rotate

- Employee leaves the team
- Suspected credential compromise
- After a security incident
- Periodically (recommended: every 90 days)

### Rotation Procedure

1. Create new password
2. Update in Payload admin (Users → Select user → Change password)
3. Update in password manager
4. Share new credentials via secure method
5. Confirm recipient can log in with new credentials

---

## Emergency Access

### If User Locked Out

1. Admin logs into Payload
2. Navigate to Users collection
3. Select the locked user
4. Reset password
5. Share new password securely

### If Admin Account Compromised

1. Immediately disable compromised account
2. Create new admin account
3. Review recent activity/changes
4. Reset all user passwords
5. Investigate breach

---

## Audit Trail

Maintain a record of:

| Date       | Action  | User                | Admin               | Notes              |
| ---------- | ------- | ------------------- | ------------------- | ------------------ |
| YYYY-MM-DD | Created | <email@example.com> | <admin@example.com> | Initial setup      |
| YYYY-MM-DD | Shared  | <email@example.com> | <admin@example.com> | Via 1Password      |
| YYYY-MM-DD | Rotated | <email@example.com> | <admin@example.com> | Scheduled rotation |

---

## Contact Information

For credential issues, contact:

- **Primary Admin**: \[Name] - \[Contact method]
- **Backup Admin**: \[Name] - \[Contact method]
- **Security Issues**: \[Security contact]

---

_This document contains sensitive procedures. Do not share outside the admin team._
