interface FeatureItem {
  title: string;
  description?: string | null;
  icon?: string | null;
  id?: string;
}

interface FeaturesBlock {
  blockType: 'features';
  id?: string;
  heading?: string | null;
  items: FeatureItem[];
}

interface FeaturesSectionProps {
  block: FeaturesBlock;
}

/**
 * Untitled UI Features Section
 *
 * Design tokens:
 * - Typography: text-3xl for heading, text-lg for feature titles
 * - Colors: Gray-50 background, gray-900 text, gray-600 for descriptions
 * - Spacing: py-24, gap-8 for grid
 * - Layout: 3-column grid on desktop, single column on mobile
 */
export function FeaturesSection({ block }: FeaturesSectionProps) {
  const { heading, items } = block;

  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {heading && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {heading}
            </h2>
          </div>
        )}
        <div className="mx-auto mt-16 max-w-7xl">
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div key={item.id || index} className="flex flex-col gap-y-4">
                <dt className="text-lg font-semibold leading-7 text-gray-900">{item.title}</dt>
                {item.description && (
                  <dd className="text-base leading-7 text-gray-600">{item.description}</dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
