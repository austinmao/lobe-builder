# TASK-013 Context: Install Untitled UI Dependencies

## Task Status: IN PROGRESS

## Phase 1: Analysis & Planning (COMPLETE)

### Current State Analysis

- **Builder Preview Route**: `/src/app/builder-preview/[tenantId]/[slug]/page.tsx` exists
- **Builder Preview Layout**: `/src/app/builder-preview/layout.tsx` exists (minimal HTML wrapper)
- **Existing Providers**: `/src/layout/GlobalProvider/index.tsx` shows pattern (antd-style based)
- **Package Manager**: pnpm (with bun for running scripts)
- **Styling**: antd-style CSS-in-JS framework for main app
- **Tailwind**: No tailwind.config.ts found (need to check if Tailwind is configured)

### Dependencies to Install

According to task requirements:

- `@untitledui/icons` - Untitled UI icon components
- `react-aria-components` - Adobe's accessible React components
- `tailwindcss-react-aria-components` - Tailwind plugin for react-aria
- `tailwind-merge` - Utility for merging Tailwind classes
- `tailwindcss-animate` - Animation utilities for Tailwind
- `next-themes` - Theme provider for Next.js

### Architecture Decisions

1. **Provider Location**: Create `/src/providers/UntitledUIProviders.tsx` (new directory)
2. **Theme CSS Location**: Create `/src/styles/untitled-ui-theme.css`
3. **Integration Point**: Update `/src/app/builder-preview/layout.tsx` to include providers
4. **Isolation Strategy**: Keep Untitled UI providers ONLY in builder-preview routes (no conflict with antd-style)

## Phase 2: Implementation Plan

### Step 1: Install Dependencies

```bash
pnpm add @untitledui/icons react-aria-components tailwindcss-react-aria-components tailwind-merge tailwindcss-animate next-themes
```

### Step 2: Create Theme CSS

File: `/src/styles/untitled-ui-theme.css`

- Define CSS variables for brand colors
- Support light-mode and dark-mode classes
- Follow Untitled UI design tokens pattern

### Step 3: Create Provider Component

File: `/src/providers/UntitledUIProviders.tsx`

- RouterProvider from react-aria-components
- ThemeProvider from next-themes
- Client component with "use client" directive

### Step 4: Update Builder Preview Layout

File: `/src/app/builder-preview/layout.tsx`

- Import UntitledUIProviders
- Import untitled-ui-theme.css
- Wrap children with providers
- Add theme class support

### Step 5: Verification

- Import test from @untitledui/icons
- Theme CSS variables loaded
- Dark mode toggle functional
- TypeScript compilation passes

## Progress Log

### 2025-11-29 - Initial Analysis

- Analyzed existing project structure
- Identified builder-preview as integration point
- Confirmed pnpm + bun setup
- Confirmed antd-style isolation strategy

### 2025-11-29 - Implementation Complete

✅ **Step 1: Dependencies Installed**

- `@untitledui/icons@0.0.19` - Untitled UI icons
- `react-aria-components@1.13.0` - Adobe accessible components
- `tailwindcss-react-aria-components@2.0.1` - Tailwind plugin
- `tailwind-merge@3.4.0` - Class merging utility
- `tailwindcss-animate@1.0.7` - Animation utilities
- `next-themes@0.4.6` - Theme provider
- `tailwindcss@4.1.17` - Tailwind CSS v4
- `postcss@8.5.6` - PostCSS
- `autoprefixer@10.4.22` - Autoprefixer

✅ **Step 2: Theme CSS Created**

- File: `/src/styles/untitled-ui-theme.css`
- Defined CSS variables for brand colors (50-950 scale)
- Defined CSS variables for gray colors (50-950 scale)
- Defined semantic colors (error, warning, success)
- Support for light-mode and dark-mode classes
- Custom shadows for both themes

✅ **Step 3: Provider Component Created**

- File: `/src/providers/UntitledUIProviders.tsx`
- RouterProvider from react-aria-components
- ThemeProvider from next-themes
- Proper "use client" directive
- Theme classes: "light-mode" and "dark-mode"

✅ **Step 4: Layout Updated**

- File: `/src/app/builder-preview/layout.tsx`
- Imported UntitledUIProviders
- Imported untitled-ui-theme.css
- Wrapped children with providers
- Added suppressHydrationWarning for theme

✅ **Step 5: Configuration Files Created**

- `tailwind.config.ts` - Tailwind configuration with theme colors
- `postcss.config.mjs` - PostCSS configuration
- Both files use proper TypeScript/ESM syntax

✅ **Step 6: Verification Files Created**

- `test-icons.tsx` - Icon import test (Home, Settings, User)
- `theme-toggle.tsx` - Dark mode toggle button
- Updated preview page to include ThemeToggle

✅ **Step 7: Type Checking Passed**

- Ran `bun run type-check`
- No errors in new files
- All Untitled UI imports resolve correctly
- React 19 compatibility confirmed
