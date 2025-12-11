# Publishing Workflow - User Guide

> **Audience**: Ceremonia team members (non-technical)
> **Last Updated**: December 2025
> **Prerequisites**: Read [Adding New Landing Pages](./adding-new-landing-pages.md) and [Editing Existing Pages](./editing-existing-pages.md)

This guide explains the draft/published workflow and how to safely publish and update pages.

---

## Understanding Draft vs Published

Every page in Payload CMS has two possible states:

| State         | Description                             | Visibility                                |
| ------------- | --------------------------------------- | ----------------------------------------- |
| **Draft**     | Work in progress, not visible to public | Only visible at `/preview/[slug]`         |
| **Published** | Live and visible to visitors            | Visible at `/lp/[slug]` and custom domain |

### Key Concepts

- **New pages start as drafts** - They won't be visible until you publish
- **Editing a published page creates a new draft** - Your changes are saved but not live
- **Publishing makes the draft live** - Visitors see your latest changes
- **You can preview before publishing** - Always check your work first

---

## The Publishing Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   CREATE ──► DRAFT ──► PREVIEW ──► PUBLISH ──► LIVE            │
│                │                                 │              │
│                │         ┌───────────────────────┘              │
│                │         │                                      │
│                └─────────▼─────────────────────────────────────►│
│                      EDIT ──► DRAFT ──► PREVIEW ──► REPUBLISH   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Publishing Process

### Step 1: Create or Edit Your Page

1. Create a new page OR edit an existing page
2. Make your content changes
3. Click **Save** (saves as draft)

### Step 2: Preview Your Draft

**Always preview before publishing!**

1. Note the page **slug** (e.g., `summer-retreat-2025`)

2. Open a new browser tab

3. Go to the preview URL:

   ```
   https://ceremoniacircle.org/preview/[slug]
   ```

   Example: `https://ceremoniacircle.org/preview/summer-retreat-2025`

4. Check your changes:
   - [ ] All text is correct
   - [ ] Images load properly
   - [ ] Links work
   - [ ] Layout looks good on desktop
   - [ ] (Optional) Check mobile view by resizing browser

### Step 3: Make Corrections (If Needed)

If you find issues in preview:

1. Return to the admin tab
2. Make corrections
3. Save again
4. Refresh preview to verify fixes

### Step 4: Publish

When you're satisfied with the preview:

**Method A: Using Publish Button**

1. Click the **Publish** button (if visible)
2. Page is now live

**Method B: Using Status Dropdown**

1. Find the **Status** or **\_status** dropdown
2. Change from "Draft" to "Published"
3. Click **Save**
4. Page is now live

### Step 5: Verify Live Page

After publishing:

1. Open the live URL:

   ```
   https://ceremoniacircle.org/lp/[slug]
   ```

   Or your custom domain URL

2. Verify everything looks correct

3. Clear browser cache if you see old content (Ctrl/Cmd + Shift + R)

---

## Republishing After Edits

When you edit a published page, you create a new draft version.

### The Republish Workflow

1. **Edit the page** in Payload admin
2. Your changes are automatically saved as a draft
3. The **live page still shows the old content**
4. **Preview** your changes at `/preview/[slug]`
5. When ready, **Publish** to make changes live

### Important Notes

- Visitors see the OLD content until you republish
- You can make multiple edits before republishing
- Preview shows your latest draft changes
- Only publish when you're ready for visitors to see the changes

---

## Publishing Checklist

Use this checklist before every publish:

### Content Check

- [ ] All text is proofread and correct
- [ ] Dates and times are accurate
- [ ] Names and locations are spelled correctly
- [ ] Contact information is up to date

### Visual Check

- [ ] Images load properly
- [ ] Images are not stretched or pixelated
- [ ] Layout looks correct
- [ ] Colors and fonts look right

### Functional Check

- [ ] All links work (click to test)
- [ ] Button links go to correct destinations
- [ ] Email/contact links work

### SEO Check (Optional)

- [ ] Meta description is filled in
- [ ] Social sharing image is uploaded
- [ ] Title is descriptive

---

## Common Scenarios

### Scenario 1: Publishing a Brand New Page

1. Create page → Add content → Save
2. Preview at `/preview/[slug]`
3. Check everything → Fix issues
4. Publish → Verify at `/lp/[slug]`

### Scenario 2: Quick Typo Fix

1. Open page → Fix typo → Save
2. (Optional) Quick preview check
3. Publish immediately
4. Verify fix is live

### Scenario 3: Major Content Update

1. Open page → Make all changes → Save frequently
2. Preview thoroughly → Check desktop + mobile
3. Have colleague review preview link
4. Publish when approved
5. Verify live page

### Scenario 4: Scheduled Update (Manual)

If you need content to go live at a specific time:

1. Prepare all content → Save as draft
2. Preview and verify everything is ready
3. At the scheduled time, log in and click Publish
4. Verify immediately

> \[!NOTE]: Payload doesn't support automated scheduled publishing. You must manually publish at the desired time.

---

## Troubleshooting Publishing Issues

### Published Page Shows Old Content

1. **Wait 30 seconds** - Cache may need to clear
2. **Hard refresh** - Press Ctrl/Cmd + Shift + R
3. **Check status** - Ensure page shows "Published" in admin
4. **Try incognito window** - Rules out browser cache

### Preview Looks Different from Live

1. Verify you're on the correct URLs
2. Check the page status in admin
3. Republish if needed
4. Clear cache on live page

### Can't Find Publish Button

Different Payload versions may show publishing differently:

1. Look for **Publish** button (top or bottom of form)
2. Look for **Status** dropdown (change to "Published")
3. Look for **\_status** field
4. Check the **Versions** tab if available

### Accidentally Published Incomplete Page

1. **Option A**: Quickly edit and republish with corrections
2. **Option B**: Unpublish (if option available) to hide while fixing
3. **Option C**: Complete the content and republish immediately

---

## Best Practices

### Before Publishing

- Always preview first
- Double-check dates, names, and contact info
- Test all links
- Have someone else review if it's important content

### While Editing Live Pages

- Make changes during low-traffic times if possible
- Have your content ready before starting
- Save frequently to avoid losing work

### After Publishing

- Verify the live page immediately
- Share the link with team members to confirm
- Keep a record of major updates

---

## Version History (If Available)

Some Payload configurations include version history:

1. Click the **Versions** tab (if visible)
2. See list of previous versions with timestamps
3. Click a version to preview it
4. **Restore** to revert to a previous version if needed

> \[!NOTE]: Version availability depends on your Payload configuration.

---

## Quick Reference

| Action               | How                                          |
| -------------------- | -------------------------------------------- |
| Save as draft        | Click **Save**                               |
| Preview draft        | Visit `/preview/[slug]`                      |
| Publish              | Click **Publish** or set status to Published |
| View live            | Visit `/lp/[slug]`                           |
| Republish after edit | Edit → Save → Publish                        |

---

_Related guides:_

- [Adding New Landing Pages](./adding-new-landing-pages.md)
- [Editing Existing Pages](./editing-existing-pages.md)
