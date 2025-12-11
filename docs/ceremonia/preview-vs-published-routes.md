# Preview vs Published Routes - Technical Reference

> **Audience**: Ceremonia team members and developers
> **Last Updated**: December 2025

This document explains the URL structure for preview and published pages.

---

## URL Structure Overview

Your landing pages are accessible through different URL patterns depending on whether they're draft or published.

### Route Summary Table

| Route Type        | URL Pattern                | Shows             | Who Can See      |
| ----------------- | -------------------------- | ----------------- | ---------------- |
| **Preview**       | `/preview/{tenant}/{slug}` | Draft content     | Anyone with link |
| **Published**     | `/page/{tenant}/{slug}`    | Published content | Anyone           |
| **Custom Domain** | `/lp/{slug}`               | Published content | Public visitors  |

---

## Preview Route

### URL Format

```
https://ceremoniacircle.org/preview/ceremonia/{slug}
```

### Examples

| Page           | Preview URL                                                         |
| -------------- | ------------------------------------------------------------------- |
| Summer Retreat | `https://ceremoniacircle.org/preview/ceremonia/summer-retreat-2025` |
| About Us       | `https://ceremoniacircle.org/preview/ceremonia/about-us`            |
| Contact        | `https://ceremoniacircle.org/preview/ceremonia/contact`             |

### Behavior

- Shows the **latest saved version** (draft)
- Works for both draft AND published pages
- Shows unpublished changes before they go live
- **Not indexed** by search engines

### Use Cases

- Review changes before publishing
- Share with team for approval
- Test new content safely
- Verify edits look correct

### Important Notes

- Preview links are **not secret** - anyone with the link can view
- Don't share preview links publicly (they show unpublished content)
- Preview reflects the most recent save, not the live version

---

## Published Route

### URL Format (Internal)

```
https://ceremoniacircle.org/page/ceremonia/{slug}
```

### Examples

| Page           | Published URL                                                    |
| -------------- | ---------------------------------------------------------------- |
| Summer Retreat | `https://ceremoniacircle.org/page/ceremonia/summer-retreat-2025` |
| About Us       | `https://ceremoniacircle.org/page/ceremonia/about-us`            |
| Contact        | `https://ceremoniacircle.org/page/ceremonia/contact`             |

### Behavior

- Shows **only published content**
- Returns 404 if page is still in draft
- Safe to share publicly
- Indexed by search engines

### Use Cases

- Internal testing of published pages
- Verifying published content
- Developer debugging

---

## Custom Domain Route

### URL Format

```
https://ceremoniacircle.org/lp/{slug}
```

### Examples

| Page           | Custom Domain URL                                    |
| -------------- | ---------------------------------------------------- |
| Summer Retreat | `https://ceremoniacircle.org/lp/summer-retreat-2025` |
| About Us       | `https://ceremoniacircle.org/lp/about-us`            |
| Contact        | `https://ceremoniacircle.org/lp/contact`             |

### Behavior

- Shows **published content only**
- Mapped from custom domain to tenant automatically
- Primary URL for public visitors
- Full SEO support

### Use Cases

- Share with the public
- Marketing materials
- Email campaigns
- Social media links

---

## URL Reference Card

### For Ceremonia Team

| What You Want         | URL to Use                                             |
| --------------------- | ------------------------------------------------------ |
| Preview draft changes | `https://ceremoniacircle.org/preview/ceremonia/{slug}` |
| Check published page  | `https://ceremoniacircle.org/lp/{slug}`                |
| Share with public     | `https://ceremoniacircle.org/lp/{slug}`                |

### Quick Copy Templates

**Preview URL Template:**

```
https://ceremoniacircle.org/preview/ceremonia/YOUR-SLUG-HERE
```

**Public URL Template:**

```
https://ceremoniacircle.org/lp/YOUR-SLUG-HERE
```

---

## Comparing Preview vs Published

| Aspect                  | Preview Route   | Published Route        |
| ----------------------- | --------------- | ---------------------- |
| Content shown           | Latest draft    | Last published version |
| Draft pages visible?    | Yes             | No (404 error)         |
| Unpublished changes?    | Visible         | Not visible            |
| Safe to share publicly? | No              | Yes                    |
| Search engine indexed?  | No              | Yes                    |
| Cache behavior          | Minimal caching | Aggressive caching     |

---

## Common Questions

### Q: I see my changes in preview but not on the live page?

**A:** You haven't published yet. In Payload admin, click Publish to make changes live.

### Q: The live page shows old content after I published?

**A:** Cache needs to clear. Wait 30 seconds, then hard refresh (Ctrl/Cmd + Shift + R).

### Q: Can visitors see preview links?

**A:** Yes, if they have the link. Don't share preview URLs publicly.

### Q: Why does my draft page show 404 on the published route?

**A:** Draft pages aren't visible on published routes. Preview draft pages at `/preview/...`

### Q: Which URL should I use in marketing materials?

**A:** Always use the public URL: `https://ceremoniacircle.org/lp/{slug}`

---

## Developer Reference

### Route Resolution Logic

```
Custom Domain Request (ceremoniacircle.org)
  ├── /lp/{slug} → Rewrite to /page/ceremonia/{slug}
  ├── /preview/ceremonia/{slug} → Fetch draft from Payload
  └── /page/ceremonia/{slug} → Fetch published from Payload

Middleware Logic:
  1. Check if hostname matches custom domain
  2. Map domain to tenant ID
  3. Rewrite /lp/* to /page/{tenant}/*
  4. Forward request to page renderer
```

### API Endpoints Used

| Route     | Payload API Query                                                            |
| --------- | ---------------------------------------------------------------------------- |
| Preview   | `GET /api/pages?where[slug][equals]={slug}&draft=true`                       |
| Published | `GET /api/pages?where[slug][equals]={slug}&where[_status][equals]=published` |

### Caching Behavior

| Route     | Cache Strategy                    |
| --------- | --------------------------------- |
| Preview   | No cache / very short TTL         |
| Published | CDN cached, revalidate on publish |

---

## Security Considerations

### Preview Links

- Not authenticated (anyone can view)
- Don't use for sensitive content before launch
- Consider using for internal review only

### Published Links

- Publicly accessible
- Appropriate for all marketing use
- SEO-friendly

### Best Practice

> Always assume preview links can be accessed by anyone. Only share preview URLs with trusted team members for content review.

---

_Related documentation:_

- [Publishing Workflow](./publishing-workflow.md)
- [Adding New Landing Pages](./adding-new-landing-pages.md)
