// Minimal stub to satisfy type-check for TASK-006
// Full implementation will be added in TASK-005

interface BuilderPreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BuilderPreviewPage({ params }: BuilderPreviewPageProps) {
  const { slug } = await params;
  return <div>Stub for {slug}</div>;
}
