# Editing Existing Pages - User Guide

> **Audience**: Ceremonia team members (non-technical)
> **Last Updated**: December 2025
> **Prerequisite**: Read [Adding New Landing Pages](./adding-new-landing-pages.md) first

This guide walks you through finding and editing existing landing pages in Payload CMS.

---

## Quick Start Checklist

Before you begin, ensure you have:

- [ ] Your Payload CMS login credentials
- [ ] The page title or slug you want to edit
- [ ] Your updated content ready

---

## Step 1: Log In to Payload CMS Admin

1. Open your browser and navigate to the Payload CMS admin URL:

   ```
   https://your-payload-domain.com/admin
   ```

2. Enter your email and password

3. Click **Log in**

---

## Step 2: Find the Page You Want to Edit

### Option A: Browse the Pages List

1. In the left sidebar, click **Pages**

2. You'll see a table with all your pages

3. The table shows:
   - **Title** - Page name
   - **Slug** - URL identifier
   - **Design System** - Visual style
   - **Updated At** - Last edit date

4. Click on the **page title** to open it for editing

### Option B: Search for a Page

1. Click **Pages** in the sidebar
2. Use the **search box** at the top of the page list
3. Type the page title or slug
4. Click on the matching result

### Option C: Sort Pages

1. Click on any column header to sort:
   - **Title** - Alphabetical order
   - **Updated At** - Most recently edited first

---

## Step 3: Edit Page Information

Once you've opened a page, you can edit any field.

### Editing Basic Fields

| Field             | How to Edit                                     |
| ----------------- | ----------------------------------------------- |
| **Title**         | Click the text field, type new title            |
| **Slug**          | Click the text field, update the URL identifier |
| **Design System** | Select from dropdown menu                       |

> \[!WARNING]: Changing the slug will change the page URL. Any links to the old URL will break.

---

## Step 4: Edit Page Sections

Sections are the content blocks that make up your page.

### Editing Text in a Section

1. Scroll down to the **Sections** area

2. Click on the section you want to edit (it will expand)

3. Edit the text fields:
   - **Title** - Main heading
   - **Subtitle** - Supporting text
   - **Description** - Body content
   - **Button labels** - CTA text

4. Changes are saved when you click **Save**

### Editing a Hero Section

1. Find the **Hero Section** block
2. Click to expand it
3. Edit fields:
   - **Title** - Main headline
   - **Subtitle** - Supporting text
   - **CTA Label** - Button text
   - **CTA Link** - Button destination URL
   - **Background Image** - Click to change or remove

### Editing a Features Section

1. Find the **Features Section** block
2. Click to expand it
3. To edit existing features:
   - Click on a feature item to expand
   - Edit **Title**, **Description**, or **Icon Name**
4. To add a new feature:
   - Click **Add Feature Item**
   - Fill in the new feature details
5. To remove a feature:
   - Click the **trash icon** next to the feature item

### Editing a CTA Section

1. Find the **Call to Action** block
2. Click to expand it
3. Edit fields:
   - **Heading** - Main CTA text
   - **Description** - Supporting information
   - **Primary Button** - Main action button (label + link)
   - **Secondary Button** - Optional secondary action

### Editing a Text Section

1. Find the **Text Section** block
2. Click to expand it
3. Edit fields:
   - **Heading** - Section title
   - **Body** - Rich text content (use the toolbar for formatting)

---

## Step 5: Reorder Sections

You can change the order sections appear on the page:

1. Hover over a section block
2. Click and hold the **drag handle** (≡ icon on the left)
3. Drag the section up or down
4. Release to drop in the new position

---

## Step 6: Add or Remove Sections

### Adding a New Section

1. Scroll to the **Sections** area
2. Click **Add Block** (or **Add Section**)
3. Choose the section type:
   - Hero Section
   - Features Section
   - Call to Action
   - Text Section
4. Fill in the required fields

### Removing a Section

1. Click on the section to expand it
2. Click the **trash icon** or **Delete** button
3. Confirm the deletion

> \[!WARNING]: Deleting a section cannot be undone after saving. Make sure you want to remove it.

---

## Step 7: Edit SEO Information

1. Scroll down to **SEO & Social Sharing**
2. Update fields:
   - **Meta Description** - Text for search results (150-160 chars)
   - **Social Sharing Image** - Image for social media posts

---

## Step 8: Save Your Changes

### Save as Draft

1. Click **Save** or **Save Draft**
2. Your changes are saved but **not published**
3. Preview your changes before publishing

### Publish Changes

1. Click **Publish** (or change status to Published and Save)
2. Changes go live immediately

---

## Step 9: Preview Your Changes

After saving:

1. Copy the page slug from the **Slug** field
2. Open the preview URL:
   ```
   https://ceremoniacircle.org/preview/[slug]
   ```
3. Check that your changes look correct
4. If satisfied, return to admin and publish

---

## Common Editing Scenarios

### Scenario 1: Fix a Typo

1. Pages → Select page → Find the text → Fix it → Save

### Scenario 2: Update Event Date

1. Pages → Select page → Find title/text with date → Update → Save → Publish

### Scenario 3: Change Button Link

1. Pages → Select page → Expand section with button → Update CTA Link → Save → Publish

### Scenario 4: Replace Hero Image

1. Pages → Select page → Expand Hero Section → Click Background Image → Upload new image → Save

### Scenario 5: Add a New Feature

1. Pages → Select page → Expand Features Section → Add Feature Item → Fill details → Save

---

## Troubleshooting

### Changes Not Appearing on Live Site

1. Did you **publish** the changes (not just save as draft)?
2. Wait 30 seconds for cache to clear
3. Hard refresh the page (Ctrl/Cmd + Shift + R)
4. Check you're on the correct URL

### Can't Find My Page

1. Check the spelling in search
2. Try searching by slug instead of title
3. Scroll through the full list
4. Ask admin if page was deleted

### Lost My Edits

1. If you navigated away without saving, changes are lost
2. Always save frequently when making many edits
3. Use **Save Draft** to preserve work-in-progress

### Accidentally Deleted a Section

1. If you haven't saved yet, refresh the page (you'll lose other unsaved changes)
2. If already saved, you'll need to recreate the section
3. Check if there's a version history (Versions tab if available)

---

## Best Practices

1. **Preview before publishing** - Always check your changes in preview
2. **Save frequently** - Don't lose work by navigating away
3. **One change at a time** - For important pages, make and verify changes incrementally
4. **Document major changes** - Keep notes of significant updates for your team
5. **Check mobile view** - Test responsive layout if making layout changes

---

## Quick Reference

| Task             | Steps                                  |
| ---------------- | -------------------------------------- |
| Find page        | Pages → Search or scroll → Click title |
| Edit text        | Click field → Type → Save              |
| Edit section     | Click to expand → Edit fields → Save   |
| Reorder sections | Drag and drop using handle             |
| Add section      | Add Block → Choose type → Fill fields  |
| Delete section   | Click trash icon → Confirm             |
| Preview          | Save → Visit `/preview/[slug]`         |
| Publish          | Click Publish or set status → Save     |

---

_Full guide for creating pages: [Adding New Landing Pages](./adding-new-landing-pages.md)_
