# Adding New Landing Pages - User Guide

> **Audience**: Ceremonia team members (non-technical)
> **Last Updated**: December 2025

This guide walks you through creating a new landing page using the Payload CMS admin interface.

---

## Quick Start Checklist

Before you begin, ensure you have:

- [ ] Your Payload CMS login credentials
- [ ] Page content ready (titles, text, images)
- [ ] A unique URL slug in mind (e.g., `summer-retreat-2025`)

---

## Step 1: Log In to Payload CMS Admin

1. Open your browser and navigate to the Payload CMS admin URL:

   ```
   https://your-payload-domain.com/admin
   ```

2. Enter your email and password

3. Click **Log in**

---

## Step 2: Navigate to Pages

1. In the left sidebar, click **Pages**
2. You'll see a list of existing pages (if any)

---

## Step 3: Create a New Page

1. Click the **Create new Page** button (top right)

2. Fill in the **required fields**:

### Basic Information

| Field                          | Description                                 | Example                   |
| ------------------------------ | ------------------------------------------- | ------------------------- |
| **Title** _(required)_         | The page title shown in browser tab and SEO | `Summer Retreat 2025`     |
| **Slug** _(required)_          | URL-friendly identifier                     | `summer-retreat-2025`     |
| **Design System** _(required)_ | Visual styling system                       | `Untitled UI` (default)   |
| **User ID** _(required)_       | Your user identifier                        | (auto-filled or provided) |

### Slug Rules

The slug must follow these rules:

- **Lowercase only** - no capital letters
- **Alphanumeric** - letters (a-z) and numbers (0-9)
- **Hyphens allowed** - use hyphens to separate words
- **No spaces** - use hyphens instead
- **No special characters** - no underscores, periods, etc.

**Valid examples:** `about-us`, `summer-2025`, `circle-gathering`
**Invalid examples:** `About-Us`, `summer_2025`, `circle.gathering`

---

## Step 4: Add Page Sections

Pages are built using **sections** (blocks). Click **Add Section** to add content blocks.

### Available Section Types

#### 1. Hero Section

The main banner at the top of your page.

| Field                | Required | Description                        |
| -------------------- | -------- | ---------------------------------- |
| **Title**            | Yes      | Main headline                      |
| **Subtitle**         | No       | Supporting text below the title    |
| **CTA Label**        | No       | Button text (e.g., "Learn More")   |
| **CTA Link**         | No       | Where the button links to          |
| **Background Image** | No       | Upload an image for the background |

**Best practices:**

- Keep the title under 10 words
- Make the CTA action-oriented ("Join Now", "Get Started")

---

#### 2. Features Section

Display a list of features, benefits, or highlights.

| Field             | Required    | Description                           |
| ----------------- | ----------- | ------------------------------------- |
| **Heading**       | No          | Section title (e.g., "Why Choose Us") |
| **Feature Items** | Yes (min 1) | List of individual features           |

**Each Feature Item contains:**

| Field           | Required | Description       |
| --------------- | -------- | ----------------- |
| **Title**       | Yes      | Feature name      |
| **Description** | No       | Brief explanation |
| **Icon Name**   | No       | Icon identifier   |

**Best practices:**

- Use 3-6 features for best visual balance
- Keep descriptions under 2 sentences

---

#### 3. Call to Action (CTA) Section

A section encouraging visitors to take action.

| Field                      | Required | Description                  |
| -------------------------- | -------- | ---------------------------- |
| **Heading**                | Yes      | Main call to action text     |
| **Description**            | No       | Supporting information       |
| **Primary Button Label**   | Yes      | Main button text             |
| **Primary Button Link**    | Yes      | Where the button goes        |
| **Secondary Button Label** | No       | Optional second button       |
| **Secondary Button Link**  | No       | Secondary button destination |

**Best practices:**

- Use contrasting button colors (handled by design system)
- Make the primary action clear and compelling

---

#### 4. Text Section

A content area for paragraphs, lists, and formatted text.

| Field       | Required | Description       |
| ----------- | -------- | ----------------- |
| **Heading** | No       | Section title     |
| **Body**    | Yes      | Rich text content |

**The rich text editor supports:**

- Bold and italic text
- Bullet and numbered lists
- Links
- Headings (H2, H3, H4)

---

## Step 5: Add SEO Information (Optional but Recommended)

Scroll down to the **SEO & Social Sharing** section:

| Field                    | Description                       | Recommendation     |
| ------------------------ | --------------------------------- | ------------------ |
| **Meta Description**     | Shows in Google search results    | 150-160 characters |
| **Social Sharing Image** | Shows when shared on social media | 1200x630 pixels    |

**Good meta description example:**

> "Join Ceremonia Circle's Summer 2025 retreat. A transformative experience combining ancient wisdom with modern practices. Limited spots available."

---

## Step 6: Save Your Page

### Save as Draft (Preview First)

1. Click **Save Draft** at the bottom of the page
2. Your page is saved but **not visible** to the public
3. Preview your page (see Step 7)

### Publish Immediately

1. Click **Publish** to make the page live
2. The page will be accessible at your custom domain

---

## Step 7: Preview Your Page

After saving as draft:

1. Copy your page slug (e.g., `summer-retreat-2025`)

2. Open the preview URL:

   ```
   https://your-domain.com/preview/[slug]
   ```

   Example: `https://ceremoniacircle.org/preview/summer-retreat-2025`

3. Check that everything looks correct before publishing

---

## Step 8: View Your Published Page

Once published, your page is accessible at:

```
https://ceremoniacircle.org/lp/[slug]
```

Example: `https://ceremoniacircle.org/lp/summer-retreat-2025`

---

## Troubleshooting

### "Slug must be lowercase alphanumeric with hyphens only"

Your slug contains invalid characters. Check for:

- Capital letters → change to lowercase
- Spaces → replace with hyphens
- Special characters → remove them

### "This field is required"

You missed a required field. Look for the red asterisk (\*) next to field labels.

### Page not appearing after publish

1. Wait 30 seconds for cache to clear
2. Try a hard refresh (Ctrl/Cmd + Shift + R)
3. Ensure the page status shows "Published"

### Image upload fails

Check that your image:

- Is under 5MB in size
- Is a supported format (JPG, PNG, WebP)
- Has a simple filename (no special characters)

---

## Quick Reference Card

| Action         | How To                               |
| -------------- | ------------------------------------ |
| Create page    | Pages → Create new Page              |
| Add section    | Click "Add Section" in sections area |
| Save draft     | Click "Save Draft" button            |
| Publish        | Click "Publish" button               |
| Preview draft  | Visit `/preview/[slug]`              |
| View published | Visit `/lp/[slug]`                   |
| Edit page      | Pages → Click page → Edit → Save     |

---

## Need Help?

Contact your system administrator if you:

- Can't log in
- Need additional user accounts
- Encounter persistent errors
- Need features not covered in this guide
