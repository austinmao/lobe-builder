interface HeroBlock {
  blockType: 'hero';
  id?: string;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  backgroundImage?: any;
}

interface HeroSectionProps {
  block: HeroBlock;
}

/**
 * Untitled UI Hero Section
 *
 * Design tokens:
 * - Typography: text-5xl/text-6xl for title (display size)
 * - Colors: Neutral grays, white backgrounds
 * - Spacing: py-24 (96px vertical padding)
 * - Buttons: Rounded-lg, shadow-sm, primary colors
 */
export function HeroSection({ block }: HeroSectionProps) {
  const { title, subtitle, ctaLabel, ctaHref } = block;

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">{title}</h1>
          {subtitle && <p className="mt-6 text-lg leading-8 text-gray-600">{subtitle}</p>}
          {ctaLabel && ctaHref && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href={ctaHref}
                className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
              >
                {ctaLabel}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
