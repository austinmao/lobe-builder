export interface PortalArtifact {
  children?: string;
  id: string;
  identifier?: string;
  language?: string;
  title?: string;
  type?: string;
}

export enum ArtifactType {
  Builder = 'application/lobe.artifacts.builder',
  Code = 'application/lobe.artifacts.code',
  Default = 'html',
  Python = 'python',
  React = 'application/lobe.artifacts.react',
}
