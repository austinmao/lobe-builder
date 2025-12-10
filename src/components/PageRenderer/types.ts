/**
 * PageRenderer Types
 *
 * TypeScript types for PageRenderer component matching Payload page schema.
 * Supports multiple design systems (untitledui, shadcn).
 */

export type DesignSystem = 'untitledui' | 'shadcn';

export interface HeroBlock {
  backgroundImage?: string;
  blockType: 'hero';
  ctaHref?: string;
  ctaLabel?: string;
  subtitle?: string;
  title: string;
}

export interface TextBlock {
  blockType: 'text';
  body: string;
  heading?: string;
}

export interface CTABlock {
  blockType: 'cta';
  description?: string;
  heading: string;
  primaryButton: {
    href: string;
    label: string;
  };
  secondaryButton?: {
    href: string;
    label: string;
  };
}

export interface FeaturesBlock {
  blockType: 'features';
  heading?: string;
  items: Array<{
    description: string;
    icon: string;
    title: string;
  }>;
}

export type PageBlock = HeroBlock | TextBlock | CTABlock | FeaturesBlock;

export interface PageData {
  designSystem?: DesignSystem;
  sections: PageBlock[];
  slug: string;
  title: string;
}

export interface PageRendererProps {
  page: PageData;
}
