# Ceremonia Team Training Session

> **Duration**: 60 minutes
> **Format**: Live walkthrough with Q\&A
> **Audience**: Ceremonia content team (non-technical)

---

## Pre-Training Checklist

### For Trainer

- [ ] Payload CMS admin is accessible
- [ ] Test credentials are ready for attendees
- [ ] Screen sharing is set up
- [ ] Recording software ready (if recording)
- [ ] Demo tenant/pages are prepared
- [ ] Backup internet connection available

### For Attendees

- [ ] Received login credentials
- [ ] Have a computer with web browser
- [ ] Calendar blocked for full 60 minutes
- [ ] Have questions ready

---

## Training Agenda

| Time | Duration | Topic                           |
| ---- | -------- | ------------------------------- |
| 0:00 | 5 min    | Welcome & Overview              |
| 0:05 | 10 min   | Login & Dashboard Tour          |
| 0:15 | 15 min   | Creating a New Page (Live Demo) |
| 0:30 | 10 min   | Editing Existing Pages          |
| 0:40 | 10 min   | Publishing Workflow             |
| 0:50 | 10 min   | Q\&A & Practice Time            |

---

## Session Content

### 1. Welcome & Overview (5 minutes)

**Talking Points:**

- What is Payload CMS?
- Why we chose it for landing pages
- What you'll learn today
- Resources available after training

**Key Message:**

> "By the end of this session, you'll be able to independently create, edit, and publish landing pages for Ceremonia."

---

### 2. Login & Dashboard Tour (10 minutes)

**Demo Steps:**

1. Open browser, navigate to admin URL
2. Enter credentials, click Login
3. Tour the dashboard:
   - Left sidebar navigation
   - Pages collection
   - Media library
   - User settings
4. Explain tenant isolation (you only see Ceremonia content)

**Hands-On:**

- Have attendees log in with their credentials
- Verify everyone can access the dashboard

**Checkpoint:**

> "Can everyone see the Pages collection in the sidebar?"

---

### 3. Creating a New Page (15 minutes)

**Demo Steps:**

1. Click Pages → Create New Page
2. Fill in basic fields:
   - Title: "Training Demo Page"
   - Slug: "training-demo-page" (explain slug rules)
   - Design System: Untitled UI
3. Add a Hero section:
   - Title: "Welcome to Our Training"
   - Subtitle: "This is a demo page"
   - CTA Label: "Learn More"
   - CTA Link: "#"
4. Add a Features section:
   - Add 3 feature items with titles and descriptions
5. Add a CTA section:
   - Heading: "Ready to Get Started?"
   - Primary button: "Contact Us"
6. Save as Draft
7. Preview at `/preview/ceremonia/training-demo-page`
8. Show difference from published route (404)

**Hands-On:**

- Have attendees create their own test page
- Walk around/check in as they work

**Checkpoint:**

> "Who has their page showing in preview? Any issues?"

---

### 4. Editing Existing Pages (10 minutes)

**Demo Steps:**

1. Navigate back to Pages list
2. Find and click on the demo page
3. Edit the hero title
4. Reorder sections (drag and drop)
5. Add a new section
6. Delete a section
7. Save changes
8. Preview to verify changes

**Hands-On:**

- Have attendees edit their test pages
- Practice adding/removing sections

**Checkpoint:**

> "Has everyone successfully edited their page?"

---

### 5. Publishing Workflow (10 minutes)

**Demo Steps:**

1. Explain draft vs published
2. Show the Publish button/status dropdown
3. Publish the demo page
4. View at published URL `/page/ceremonia/training-demo-page`
5. Make an edit, save (creates new draft)
6. Show preview has new content, published has old
7. Republish to make changes live
8. Verify at published URL

**Key Points:**

- Always preview before publishing
- Changes aren't live until you publish
- Published URL is what visitors see

**Checkpoint:**

> "Can everyone see their published page at the live URL?"

---

### 6. Q\&A & Practice Time (10 minutes)

**Common Questions to Address:**

**Q: How do I undo changes?**
A: If you haven't saved, refresh the page. If you've saved, you'll need to manually revert or check version history if available.

**Q: Can I schedule content to publish later?**
A: Currently, publishing is manual. Plan to log in at your desired publish time.

**Q: What if I make a mistake on a live page?**
A: Edit the page, fix the mistake, and republish immediately. It only takes a few seconds.

**Q: How do I add images?**
A: Use the Media library or upload directly in image fields.

**Q: Can multiple people edit the same page?**
A: Yes, but avoid editing simultaneously. The last save wins.

**Practice Exercise:**

> "Take 5 minutes to create a new page from scratch - any topic you want. Practice the full workflow: create, add sections, preview, publish."

---

## Post-Training Resources

### Documentation Links

Share these with attendees:

1. **Adding New Pages**: `docs/ceremonia/adding-new-landing-pages.md`
2. **Editing Pages**: `docs/ceremonia/editing-existing-pages.md`
3. **Publishing Workflow**: `docs/ceremonia/publishing-workflow.md`
4. **URL Reference**: `docs/ceremonia/preview-vs-published-routes.md`
5. **Quick Reference Card**: `docs/ceremonia/quick-reference-landing-pages.md`

### Support Contacts

- **Technical Issues**: \[Admin contact]
- **Content Questions**: \[Content lead contact]
- **Emergency**: \[Emergency contact]

---

## Follow-Up Plan

### Within 24 Hours

- [ ] Send recording link (if recorded)
- [ ] Send documentation links
- [ ] Send support contact information

### Within 1 Week

- [ ] Check in with team via email/Slack
- [ ] Ask if any questions have come up
- [ ] Offer additional help if needed

### Within 1 Month

- [ ] Review any pages created by team
- [ ] Gather feedback on workflow
- [ ] Address any recurring issues

---

## Troubleshooting During Training

### "I can't log in"

1. Verify correct URL
2. Check email/password spelling
3. Try password reset if available
4. Use backup credentials if prepared

### "I don't see Pages in the sidebar"

1. Verify user has correct tenant assignment
2. Check user role permissions
3. Have admin verify account setup

### "My changes aren't showing"

1. Did they save? (Check for success message)
2. Are they on preview or published URL?
3. Try hard refresh (Ctrl/Cmd + Shift + R)

### "The page looks broken"

1. Check all required fields are filled
2. Verify section content is valid
3. Try removing and re-adding problematic section

---

## Training Evaluation

### Quick Survey (Send After Training)

1. How confident do you feel creating pages? (1-5)
2. How confident do you feel editing pages? (1-5)
3. How confident do you feel publishing pages? (1-5)
4. What was most helpful in the training?
5. What would you like more help with?
6. Any other feedback?

### Success Metrics

- [ ] All attendees successfully logged in
- [ ] All attendees created a test page
- [ ] All attendees published a page
- [ ] All attendees can find documentation
- [ ] Post-training confidence average ≥ 4/5

---

## Appendix: Backup Demo Script

If live demo fails, use these screenshots/descriptions:

### Creating a Page

1. \[Screenshot: Create New Page button]
2. \[Screenshot: Filled basic fields]
3. \[Screenshot: Adding Hero section]
4. \[Screenshot: Complete page with sections]
5. \[Screenshot: Save Draft button]
6. \[Screenshot: Preview page]

### Publishing

1. \[Screenshot: Publish button location]
2. \[Screenshot: Success message]
3. \[Screenshot: Published page URL]

---

_This training material is designed for Ceremonia team onboarding. Update as needed based on feedback._
