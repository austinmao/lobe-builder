import type { Block } from 'payload';

export const TextBlock: Block = {
  slug: 'text',
  labels: {
    singular: 'Text Section',
    plural: 'Text Sections',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      label: 'Body',
    },
  ],
};
