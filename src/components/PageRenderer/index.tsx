/**
 * PageRenderer Component
 *
 * Main component that maps Payload page data to section components.
 * Supports multiple design systems (untitledui, shadcn) via the designSystem field.
 * Defaults to 'untitledui' if designSystem field is missing.
 *
 * Features:
 * - Maps blockType to corresponding section component
 * - Design system switching (untitledui implemented, shadcn placeholder)
 * - Graceful error handling (console warning for unknown block types, skip render)
 * - Type-safe component mapping
 */

'use client';

import type { ComponentType, ReactNode } from 'react';

import { CTASection } from './sections/CTASection';
import { FeaturesSection } from './sections/FeaturesSection';
import { HeroSection } from './sections/HeroSection';
import { TextSection } from './sections/TextSection';
import type { DesignSystem, PageBlock, PageRendererProps } from './types';

/**
 * PageRenderer Component
 *
 * Main component that maps Payload page data to section components.
 * Supports multiple design systems (untitledui, shadcn) via the designSystem field.
 * Defaults to 'untitledui' if designSystem field is missing.
 *
 * Features:
 * - Maps blockType to corresponding section component
 * - Design system switching (untitledui implemented, shadcn placeholder)
 * - Graceful error handling (console warning for unknown block types, skip render)
 * - Type-safe component mapping
 */

/**
 * Component mapping for Untitled UI design system
 */
const UNTITLED_UI_COMPONENTS = {
  cta: CTASection,
  features: FeaturesSection,
  hero: HeroSection,
  text: TextSection,
} as const;

/**
 * Component mapping for Shadcn design system (placeholders)
 * These will be implemented in a future phase
 */
const SHADCN_COMPONENTS = {
  cta: function ShadcnCTA() {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Shadcn CTA (Coming Soon)</div>;
  },
  features: function ShadcnFeatures() {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>Shadcn Features (Coming Soon)</div>
    );
  },
  hero: function ShadcnHero() {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Shadcn Hero (Coming Soon)</div>;
  },
  text: function ShadcnText() {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Shadcn Text (Coming Soon)</div>;
  },
} as const;

/**
 * Master component mapping by design system
 */
const DESIGN_SYSTEM_COMPONENTS = {
  shadcn: SHADCN_COMPONENTS,
  untitledui: UNTITLED_UI_COMPONENTS,
} as const;

/**
 * Type guard to check if blockType is valid
 */
function isValidBlockType(blockType: string): blockType is keyof typeof UNTITLED_UI_COMPONENTS {
  return blockType in UNTITLED_UI_COMPONENTS;
}

/**
 * Render a single block based on its type and design system
 */
function renderBlock(
  block: PageBlock,
  designSystem: DesignSystem,
  index: number,
): ReactNode | null {
  const { blockType } = block;

  // Check if blockType is valid
  if (!isValidBlockType(blockType)) {
    console.warn(
      `[PageRenderer] Unknown blockType: "${blockType}" at index ${index}. Skipping render.`,
    );
    return null;
  }

  // Get component map for selected design system
  const componentMap = DESIGN_SYSTEM_COMPONENTS[designSystem];
  const Component = componentMap[blockType] as ComponentType<any>;

  // Render component with block props (excluding blockType)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { blockType: _blockType, ...props } = block;

  return <Component key={`${blockType}-${index}`} {...props} />;
}

/**
 * PageRenderer Component
 *
 * Renders a complete page from Payload data with support for multiple design systems.
 *
 * @param page - Page data from Payload CMS
 * @returns Rendered page with all sections
 */
export function PageRenderer({ page }: PageRendererProps) {
  const { sections, designSystem = 'untitledui' } = page;

  // Handle empty sections array
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="page-renderer">
      {sections.map((block, index) => renderBlock(block, designSystem, index))}
    </div>
  );
}
