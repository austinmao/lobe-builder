import * as migration_20251130_224410 from './20251130_224410';
import * as migration_20251210_205234 from './20251210_205234';

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
];
