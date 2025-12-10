import type { Page } from '../../payload-types';
import { CTASection } from './blocks/CTASection';
import { FeaturesSection } from './blocks/FeaturesSection';
import { HeroSection } from './blocks/HeroSection';
import { TextSection } from './blocks/TextSection';

interface PageRendererProps {
  page: Page;
}

export function PageRenderer({ page }: PageRendererProps) {
  const { sections, title, designSystem } = page;

  return (
    <div data-design-system={designSystem}>
      {/* Page metadata - could be used for SEO */}
      <div className="sr-only">
        <h1>{title}</h1>
      </div>

      {/* Render sections */}
      {sections?.map((section: any, index: number) => {
        if (!section) return null;

        switch (section.blockType) {
          case 'hero':
            return <HeroSection key={section.id || index} block={section} />;
          case 'text':
            return <TextSection key={section.id || index} block={section} />;
          case 'cta':
            return <CTASection key={section.id || index} block={section} />;
          case 'features':
            return <FeaturesSection key={section.id || index} block={section} />;
          default:
            console.warn(`Unknown block type: ${(section as any).blockType}`);
            return null;
        }
      })}
    </div>
  );
}
