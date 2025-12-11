interface CTABlock {
  blockType: 'cta';
  id?: string;
  heading: string;
  description?: string | null;
  primaryButton?: {
    label: string;
    href: string;
  } | null;
  secondaryButton?: {
    label?: string | null;
    href?: string | null;
  } | null;
}

interface CTASectionProps {
  block: CTABlock;
}

/**
 * Untitled UI CTA Section
 *
 * Design tokens:
 * - Typography: text-3xl for heading, text-lg for description
 * - Colors: Gray-50 background, gray-900 primary button
 * - Spacing: py-24, gap-x-6 for buttons
 * - Buttons: Primary (solid) and secondary (outline) styles
 */
export function CTASection({ block }: CTASectionProps) {
  const { heading, description, primaryButton, secondaryButton } = block;

  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{heading}</h2>
          {description && <p className="mt-6 text-lg leading-8 text-gray-600">{description}</p>}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {primaryButton && (
              <a
                href={primaryButton.href}
                className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
              >
                {primaryButton.label}
              </a>
            )}
            {secondaryButton?.label && secondaryButton?.href && (
              <a
                href={secondaryButton.href}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
              >
                {secondaryButton.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
