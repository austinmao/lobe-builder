# TASK-005 Implementation Plan

## Objective

Add Builder artifact type to LobeChat types

## Implementation Steps

### Step 1: Read current artifact.ts

- File: `packages/types/src/artifact.ts`
- Understand existing ArtifactType enum structure

### Step 2: Add Builder type

```typescript
export enum ArtifactType {
  Code = 'application/lobe.artifacts.code',
  Default = 'html',
  Python = 'python',
  React = 'application/lobe.artifacts.react',
  Builder = 'application/lobe.artifacts.builder', // NEW
}
```

### Step 3: Verify TypeScript compiles

- Run: `bun run type-check`
- Expected: No errors

## Verification

- [ ] ArtifactType.Builder added
- [ ] TypeScript compilation passes
