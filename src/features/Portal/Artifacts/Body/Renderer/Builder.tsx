import { memo, useMemo } from 'react';

interface BuilderRendererProps {
  content: string;
}

const BuilderRenderer = memo<BuilderRendererProps>(({ content }) => {
  const { builderUrl } = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return { builderUrl: '' };
    }
  }, [content]);

  if (!builderUrl) {
    return <div>Invalid Builder artifact</div>;
  }

  return (
    <iframe
      src={builderUrl}
      style={{
        border: 'none',
        height: '100%',
        width: '100%',
      }}
      title="Builder Page Preview"
    />
  );
});

export default BuilderRenderer;
