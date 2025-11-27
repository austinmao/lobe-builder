import type { BuilderBlock, PageSpec, PageSpecSection } from '@lobechat/types';

/**
 * Converts a single PageSpec section to a Builder block
 * @param section - The section to convert
 * @returns A Builder block representing the section
 */
function convertSectionToBlock(section: PageSpecSection): BuilderBlock {
  switch (section.type) {
    case 'hero': {
      return {
        '@type': '@builder.io/sdk:Element',
        'component': {
          name: 'Hero',
          options: {
            ctaLabel: section.ctaLabel,
            subtitle: section.subtitle,
            title: section.title,
          },
        },
      };
    }
    case 'text': {
      return {
        '@type': '@builder.io/sdk:Element',
        'component': {
          name: 'Text',
          options: {
            text: `<h2>${section.heading}</h2><p>${section.body}</p>`,
          },
        },
      };
    }
    default: {
      throw new Error(`Unknown section type: ${section.type}`);
    }
  }
}

/**
 * Converts a PageSpec JSON object to Builder.io block format
 * @param pageSpec - The page specification containing sections to convert
 * @returns Array of Builder blocks representing the page content
 */
export function pageSpecToBuilderContent(pageSpec: PageSpec): BuilderBlock[] {
  return pageSpec.sections.map((section) => convertSectionToBlock(section));
}
