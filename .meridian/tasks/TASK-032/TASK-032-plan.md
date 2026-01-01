# Plan: Ceremonia Year Reflection Landing Page

## Overview

Create an interactive, single-page Year Reflection form at `/lp/ceremonia-new-year-manifestation-guide` with month-by-month reflections, "Zoom Out" sections, localStorage autosave, and export capabilities.

**Access URL:** `https://live.ceremoniacircle.org/lp/ceremonia-new-year-manifestation-guide`

## Architecture Decision

**Chosen Approach: Standalone Next.js Page** (not CMS-managed)

**Rationale:**

- The form structure is fixed (not CMS-editable content)
- Requires complex interactivity (accordions, autosave, exports) beyond CMS blocks
- One-off feature with specific UX requirements
- CMS blocks are designed for static content, not stateful forms

---

## Technical Decisions (Finalized)

### Styling Approach: Tailwind CSS + CSS Variables

- Use Tailwind utility classes (already available via `@/styles/untitled-ui-theme.css`)
- Add Ceremonia brand colors as CSS variables in a page-specific style block
- Consistent with existing Untitled UI pattern in `src/components/PageRenderer/sections/`

### Route Structure: Custom Domain Only

- Page accessible at: `live.ceremoniacircle.org/lp/ceremonia-new-year-manifestation-guide`
- Uses existing `/lp/*` → `/page/ceremonia/*` middleware rewrite
- No middleware changes needed

### PDF Export: Browser Print-to-PDF

- Implement `@media print` stylesheet
- Expand all accordions, hide UI chrome on print
- User uses browser's "Print to PDF" feature

---

## File Structure

```
src/app/page/ceremonia/ceremonia-new-year-manifestation-guide/
├── page.tsx              # Main page component
├── layout.tsx            # Minimal layout (no app chrome)

src/features/CeremoniaReflection/
├── index.tsx             # Main form container
├── types.ts              # TypeScript interfaces
├── useReflectionStore.ts # localStorage state with ahooks
├── components/
│   ├── Header.tsx        # Hero section with title/subtitle
│   ├── HowToUse.tsx      # Collapsible instructions
│   ├── MonthCard.tsx     # Month reflection card (accordion)
│   ├── MonthProgress.tsx # X/12 completed indicator
│   ├── PendulumSection.tsx
│   ├── ImportanceSection.tsx
│   ├── NextLineSection.tsx
│   ├── ClosingMantra.tsx
│   ├── ExportMenu.tsx    # JSON/Markdown/Print buttons
│   └── StickyNav.tsx     # Sticky top bar with progress
├── utils/
│   ├── exportMarkdown.ts # Generate markdown output
│   └── completion.ts     # Calculate completion status
```

---

## Data Model

```typescript
interface ReflectionData {
  months: Record<Month, MonthReflection>;
  pendulums: PendulumSection;
  importance: ImportanceSection;
  nextLine: NextLineSection;
  meta: {
    updatedAt: string;
    version: number;
  };
}

interface MonthReflection {
  stoodOut: string; // What stood out this month?
  emotions: string; // Dominant emotions or tone
  innerState: string; // What this reveals about inner state
  chapterTitle: string; // Chapter title (single line)
}

interface PendulumSection {
  primary: string;
  showedUp: string;
  cost: string;
}

interface ImportanceSection {
  meanTooMuch: string;
  withoutIt: string;
  reactedBy: string;
  reframe: string;
}

interface NextLineSection {
  state: string; // Ease | Trust | Presence | Clarity | etc.
  feelsLike: string;
  sentences: string;
  action: string;
}

type Month =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';
```

---

## Implementation Steps

### Phase 1: Foundation

1. Create page route and layout
2. Set up state with ahooks useLocalStorageState
3. Create basic component structure
4. Implement brand colors as CSS variables

### Phase 2: Form Sections

5. Build Header/Hero component
6. Build collapsible HowToUse section
7. Build MonthCard accordion component
8. Build month progress indicator
9. Wire up 12 month cards with store

### Phase 3: Zoom Out Sections

10. Build PendulumSection with Cielo Blue accent
11. Build ImportanceSection with Corazón Rose accent
12. Build NextLineSection with Sol Orange accent + state chips

### Phase 4: Navigation & Export

13. Build StickyNav with progress and jump-to-month
14. Build ExportMenu (JSON, Markdown, Print)
15. Implement export utilities

### Phase 5: Polish

16. Add print stylesheet
17. Add clear data confirmation modal
18. Accessibility audit (labels, ARIA, keyboard nav)
19. Mobile responsiveness testing

---

## Brand Colors (CSS Variables)

```css
/* Add to page-level style block */
:root {
  --ceremonia-sol-orange: #fbae17;
  --ceremonia-corazon-rose: #e31c78;
  --ceremonia-cielo-blue: #6283c2;
  --ceremonia-tierra-teal: #65c5b2;
  --ceremonia-charcoal: #222;
  --ceremonia-charcoal-light: #333;
  --ceremonia-bg: #fafafa;
}
```

---

## Key Utilities to Reuse

From `@lobechat/utils`:

- `exportFile()` - Plain text / Markdown export
- `exportJSONFile()` - JSON export

From `ahooks`:

- `useMemoizedFn` - Memoized callbacks
- `useLocalStorageState` - localStorage with auto-serialization

---

## Acceptance Criteria

1. [ ] Page loads at `live.ceremoniacircle.org/lp/ceremonia-new-year-manifestation-guide`
2. [ ] 12 month accordions with 4 fields each (collapsible, Jan open by default)
3. [ ] Progress indicator shows X/12 months completed
4. [ ] 3 Zoom Out sections with accent colors (Blue, Rose, Orange)
5. [ ] State chips for "Choosing Your Next Line" section
6. [ ] Autosave to localStorage (debounced, with "Saved" indicator)
7. [ ] Export JSON button (downloads .json file)
8. [ ] Copy JSON to clipboard button
9. [ ] Export Markdown button (downloads .md file)
10. [ ] Print stylesheet formats page for PDF export
11. [ ] Clear data button with confirmation modal
12. [ ] Mobile responsive (mobile-first)
13. [ ] Accessible (labels, ARIA, keyboard nav)
14. [ ] Ceremonia branding (colors, typography, spacing)
