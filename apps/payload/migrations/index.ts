import * as migration_20251130_224410 from './20251130_224410';
import * as migration_20251210_205234 from './20251210_205234';
import * as migration_20251210_230623_add_page_seo_fields from './20251210_230623_add_page_seo_fields';
import * as migration_20251211_100000_add_tenant_domain_fields from './20251211_100000_add_tenant_domain_fields';

export const migrations = [
  {
    up: migration_20251130_224410.up,
    down: migration_20251130_224410.down,
    name: '20251130_224410',
  },
  {
    up: migration_20251210_205234.up,
    down: migration_20251210_205234.down,
    name: '20251210_205234',
  },
  {
    up: migration_20251210_230623_add_page_seo_fields.up,
    down: migration_20251210_230623_add_page_seo_fields.down,
    name: '20251210_230623_add_page_seo_fields',
  },
  {
    up: migration_20251211_100000_add_tenant_domain_fields.up,
    down: migration_20251211_100000_add_tenant_domain_fields.down,
    name: '20251211_100000_add_tenant_domain_fields',
  },
];
