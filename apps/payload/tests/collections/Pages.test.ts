import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { CTABlock, FeaturesBlock, HeroBlock, TextBlock } from '../../src/blocks';
import { Pages } from '../../src/collections/Pages';

// Helper to check if a field has a name property (not all Field types do)
const hasName = (field: Field): field is Field & { name: string } => 'name' in field;

describe('Pages Collection Schema', () => {
  it('should have correct slug', () => {
    expect(Pages.slug).toBe('pages');
  });

  it('should have correct labels', () => {
    expect(Pages.labels).toEqual({
      singular: 'Page',
      plural: 'Pages',
    });
  });

  it('should have all required fields', () => {
    const fieldNames = Pages.fields.filter(hasName).map((field) => field.name);
    // Note: tenantId field was removed - the multi-tenant plugin will inject a 'tenant' relationship field
    expect(fieldNames).toContain('userId');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('designSystem');
    expect(fieldNames).toContain('sections');
  });

  it('should not have manual tenantId field (handled by multi-tenant plugin)', () => {
    const tenantIdField = Pages.fields.filter(hasName).find((field) => field.name === 'tenantId');
    // The manual tenantId field should not exist - the plugin injects a 'tenant' relationship field instead
    expect(tenantIdField).toBeUndefined();
  });

  it('should have userId field with index: true', () => {
    const userIdField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'userId') as Field & { required?: boolean; index?: boolean };
    expect(userIdField).toBeDefined();
    expect(userIdField?.type).toBe('text');
    expect(userIdField?.required).toBe(true);
    expect(userIdField?.index).toBe(true);
  });

  it('should have slug field with validation', () => {
    const slugField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'slug') as Field & {
      required?: boolean;
      unique?: boolean;
      validate?: unknown;
    };
    expect(slugField).toBeDefined();
    expect(slugField?.type).toBe('text');
    expect(slugField?.required).toBe(true);
    expect(slugField?.unique).toBe(true);
    expect(slugField?.validate).toBeDefined();
  });

  it('should have title field as required', () => {
    const titleField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'title') as Field & { required?: boolean };
    expect(titleField).toBeDefined();
    expect(titleField?.type).toBe('text');
    expect(titleField?.required).toBe(true);
  });

  it('should have designSystem field with correct options', () => {
    const designSystemField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'designSystem') as Field & {
      required?: boolean;
      defaultValue?: string;
      options?: unknown[];
    };
    expect(designSystemField).toBeDefined();
    expect(designSystemField?.type).toBe('select');
    expect(designSystemField?.required).toBe(true);
    expect(designSystemField?.defaultValue).toBe('untitledui');
    expect(designSystemField?.options).toEqual([
      { label: 'Untitled UI', value: 'untitledui' },
      { label: 'shadcn/ui', value: 'shadcn' },
    ]);
  });

  it('should have sections field as blocks type', () => {
    const sectionsField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'sections') as Field & {
      required?: boolean;
      minRows?: number;
    };
    expect(sectionsField).toBeDefined();
    expect(sectionsField?.type).toBe('blocks');
    expect(sectionsField?.required).toBe(true);
    expect(sectionsField?.minRows).toBe(1);
  });

  it('should include all four block types in sections field', () => {
    const sectionsField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'sections') as Field & { blocks?: unknown[] };
    expect(sectionsField?.blocks).toEqual([HeroBlock, TextBlock, CTABlock, FeaturesBlock]);
  });
});

describe('Slug Validation', () => {
  it('should accept valid lowercase slug with hyphens', () => {
    const slugField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'slug') as Field & {
      validate?: (val: unknown) => boolean | string;
    };
    const validate = slugField?.validate;

    if (typeof validate === 'function') {
      expect(validate('valid-slug')).toBe(true);
      expect(validate('another-valid-slug-123')).toBe(true);
      expect(validate('slug123')).toBe(true);
    }
  });

  it('should reject uppercase characters in slug', () => {
    const slugField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'slug') as Field & {
      validate?: (val: unknown) => boolean | string;
    };
    const validate = slugField?.validate;

    if (typeof validate === 'function') {
      const result = validate('Invalid-Slug');
      expect(result).toBe(
        'Slug must be lowercase alphanumeric with hyphens only (no uppercase, no special characters)',
      );
    }
  });

  it('should reject special characters in slug', () => {
    const slugField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'slug') as Field & {
      validate?: (val: unknown) => boolean | string;
    };
    const validate = slugField?.validate;

    if (typeof validate === 'function') {
      expect(validate('slug_with_underscore')).toBe(
        'Slug must be lowercase alphanumeric with hyphens only (no uppercase, no special characters)',
      );
      expect(validate('slug.with.dots')).toBe(
        'Slug must be lowercase alphanumeric with hyphens only (no uppercase, no special characters)',
      );
      expect(validate('slug@special')).toBe(
        'Slug must be lowercase alphanumeric with hyphens only (no uppercase, no special characters)',
      );
    }
  });

  it('should reject slug with leading or trailing hyphens', () => {
    const slugField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'slug') as Field & {
      validate?: (val: unknown) => boolean | string;
    };
    const validate = slugField?.validate;

    if (typeof validate === 'function') {
      expect(validate('-leading-hyphen')).toBe(
        'Slug must be lowercase alphanumeric with hyphens only (no uppercase, no special characters)',
      );
      expect(validate('trailing-hyphen-')).toBe(
        'Slug must be lowercase alphanumeric with hyphens only (no uppercase, no special characters)',
      );
    }
  });

  it('should reject non-string slug values', () => {
    const slugField = Pages.fields
      .filter(hasName)
      .find((field) => field.name === 'slug') as Field & {
      validate?: (val: unknown) => boolean | string;
    };
    const validate = slugField?.validate;

    if (typeof validate === 'function') {
      expect(validate(123)).toBe('Slug must be a string');
      expect(validate(null)).toBe('Slug must be a string');
      expect(validate(undefined)).toBe('Slug must be a string');
    }
  });
});

describe('Block Definitions', () => {
  describe('HeroBlock', () => {
    it('should have correct slug and labels', () => {
      expect(HeroBlock.slug).toBe('hero');
      expect(HeroBlock.labels).toEqual({
        singular: 'Hero Section',
        plural: 'Hero Sections',
      });
    });

    it('should have all required fields', () => {
      const fieldNames = HeroBlock.fields.filter(hasName).map((field) => field.name);
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('subtitle');
      expect(fieldNames).toContain('ctaLabel');
      expect(fieldNames).toContain('ctaHref');
      expect(fieldNames).toContain('backgroundImage');
    });

    it('should have title as required field', () => {
      const titleField = HeroBlock.fields
        .filter(hasName)
        .find((field) => field.name === 'title') as Field & { required?: boolean };
      expect(titleField?.required).toBe(true);
    });

    it('should have backgroundImage as upload field', () => {
      const bgImageField = HeroBlock.fields
        .filter(hasName)
        .find((field) => field.name === 'backgroundImage') as Field & { relationTo?: string };
      expect(bgImageField?.type).toBe('upload');
      expect(bgImageField?.relationTo).toBe('media');
    });
  });

  describe('TextBlock', () => {
    it('should have correct slug and labels', () => {
      expect(TextBlock.slug).toBe('text');
      expect(TextBlock.labels).toEqual({
        singular: 'Text Section',
        plural: 'Text Sections',
      });
    });

    it('should have heading and body fields', () => {
      const fieldNames = TextBlock.fields.filter(hasName).map((field) => field.name);
      expect(fieldNames).toContain('heading');
      expect(fieldNames).toContain('body');
    });

    it('should have body as required richText field', () => {
      const bodyField = TextBlock.fields
        .filter(hasName)
        .find((field) => field.name === 'body') as Field & { required?: boolean };
      expect(bodyField?.type).toBe('richText');
      expect(bodyField?.required).toBe(true);
    });
  });

  describe('CTABlock', () => {
    it('should have correct slug and labels', () => {
      expect(CTABlock.slug).toBe('cta');
      expect(CTABlock.labels).toEqual({
        singular: 'Call to Action',
        plural: 'Call to Actions',
      });
    });

    it('should have all required fields', () => {
      const fieldNames = CTABlock.fields.filter(hasName).map((field) => field.name);
      expect(fieldNames).toContain('heading');
      expect(fieldNames).toContain('description');
      expect(fieldNames).toContain('primaryButton');
      expect(fieldNames).toContain('secondaryButton');
    });

    it('should have heading as required field', () => {
      const headingField = CTABlock.fields
        .filter(hasName)
        .find((field) => field.name === 'heading') as Field & { required?: boolean };
      expect(headingField?.required).toBe(true);
    });

    it('should have primaryButton as group with label and href', () => {
      const primaryButtonField = CTABlock.fields
        .filter(hasName)
        .find((field) => field.name === 'primaryButton') as Field & { fields?: Field[] };
      expect(primaryButtonField?.type).toBe('group');
      expect(primaryButtonField?.fields).toHaveLength(2);

      const labelField = primaryButtonField?.fields
        ?.filter(hasName)
        .find((f) => f.name === 'label') as Field & { required?: boolean };
      const hrefField = primaryButtonField?.fields
        ?.filter(hasName)
        .find((f) => f.name === 'href') as Field & { required?: boolean };

      expect(labelField?.required).toBe(true);
      expect(hrefField?.required).toBe(true);
    });

    it('should have secondaryButton as optional group', () => {
      const secondaryButtonField = CTABlock.fields
        .filter(hasName)
        .find((field) => field.name === 'secondaryButton') as Field & { fields?: Field[] };
      expect(secondaryButtonField?.type).toBe('group');

      const labelField = secondaryButtonField?.fields
        ?.filter(hasName)
        .find((f) => f.name === 'label') as Field & { required?: boolean };
      const hrefField = secondaryButtonField?.fields
        ?.filter(hasName)
        .find((f) => f.name === 'href') as Field & { required?: boolean };

      expect(labelField?.required).toBeUndefined();
      expect(hrefField?.required).toBeUndefined();
    });
  });

  describe('FeaturesBlock', () => {
    it('should have correct slug and labels', () => {
      expect(FeaturesBlock.slug).toBe('features');
      expect(FeaturesBlock.labels).toEqual({
        singular: 'Features Section',
        plural: 'Features Sections',
      });
    });

    it('should have heading and items fields', () => {
      const fieldNames = FeaturesBlock.fields.filter(hasName).map((field) => field.name);
      expect(fieldNames).toContain('heading');
      expect(fieldNames).toContain('items');
    });

    it('should have items as required array with minRows', () => {
      const itemsField = FeaturesBlock.fields
        .filter(hasName)
        .find((field) => field.name === 'items') as Field & {
        required?: boolean;
        minRows?: number;
      };
      expect(itemsField?.type).toBe('array');
      expect(itemsField?.required).toBe(true);
      expect(itemsField?.minRows).toBe(1);
    });

    it('should have items array with title, description, and icon fields', () => {
      const itemsField = FeaturesBlock.fields
        .filter(hasName)
        .find((field) => field.name === 'items') as Field & { fields?: Field[] };
      const itemFieldNames = itemsField?.fields?.filter(hasName).map((field) => field.name);

      expect(itemFieldNames).toContain('title');
      expect(itemFieldNames).toContain('description');
      expect(itemFieldNames).toContain('icon');

      const titleField = itemsField?.fields
        ?.filter(hasName)
        .find((f) => f.name === 'title') as Field & { required?: boolean };
      expect(titleField?.required).toBe(true);
    });
  });
});
