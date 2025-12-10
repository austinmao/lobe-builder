import * as migration_20251130_224410 from './20251130_224410';

export const migrations = [
  {
    up: migration_20251130_224410.up,
    down: migration_20251130_224410.down,
    name: '20251130_224410',
  },
];
