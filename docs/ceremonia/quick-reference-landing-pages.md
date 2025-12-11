# Landing Pages - Quick Reference Card

> Print this card and keep it handy!

---

## URLs

| Purpose        | URL Pattern                                  |
| -------------- | -------------------------------------------- |
| Admin Login    | `https://your-payload-domain.com/admin`      |
| Preview Draft  | `https://ceremoniacircle.org/preview/[slug]` |
| Published Page | `https://ceremoniacircle.org/lp/[slug]`      |

---

## Create New Page

1. **Pages** → **Create new Page**
2. Fill in: Title, Slug, Design System
3. Add sections (Hero, Features, CTA, Text)
4. Add SEO info (optional)
5. **Save Draft** or **Publish**

---

## Slug Rules

| Valid              | Invalid            |
| ------------------ | ------------------ |
| `about-us`         | `About-Us`         |
| `summer-2025`      | `summer_2025`      |
| `circle-gathering` | `circle.gathering` |

**Remember**: lowercase, alphanumeric, hyphens only

---

## Section Types

| Type         | Use For                                      |
| ------------ | -------------------------------------------- |
| **Hero**     | Main banner with title, subtitle, CTA button |
| **Features** | List of features/benefits (3-6 items ideal)  |
| **CTA**      | Call to action with buttons                  |
| **Text**     | Rich text content (paragraphs, lists)        |

---

## Required Fields (\*)

- **Title** - Page title
- **Slug** - URL identifier
- **Design System** - Visual style
- **User ID** - Your identifier
- **Sections** - At least one section

---

## Draft vs Published

| Draft                       | Published         |
| --------------------------- | ----------------- |
| Only visible at `/preview/` | Visible at `/lp/` |
| Safe to edit                | Live to visitors  |
| Use for review              | Ready for public  |

---

## Common Actions

| Action           | Steps                                |
| ---------------- | ------------------------------------ |
| Edit page        | Pages → Click title → Edit → Save    |
| Delete section   | Click section → Delete button        |
| Reorder sections | Drag sections up/down                |
| Upload image     | Click upload field → Select file     |
| Preview          | Save Draft → Visit `/preview/[slug]` |

---

## Troubleshooting

| Problem          | Solution                       |
| ---------------- | ------------------------------ |
| Slug error       | Use lowercase, hyphens only    |
| Required field   | Look for red asterisk (\*)     |
| Page not showing | Wait 30s, hard refresh         |
| Image fails      | Check size < 5MB, JPG/PNG/WebP |

---

_Full guide: `docs/ceremonia/adding-new-landing-pages.md`_
