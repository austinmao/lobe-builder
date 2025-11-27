import { builder } from '@builder.io/sdk';
import { Content } from '@builder.io/sdk-react-nextjs';

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || '';

// Initialize Builder.io with the public API key
// Note: This file will be deleted when migrating to Payload CMS (Phase 5)
builder.init(BUILDER_API_KEY);

interface BuilderPreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BuilderPreviewPage({ params }: BuilderPreviewPageProps) {
  const { slug } = await params;

  // Fetch content from Builder.io with includeUnpublished for preview
  const content = await builder
    .get('page', {
      options: { includeUnpublished: true },
      userAttributes: { urlPath: `/${slug}` },
    })
    .promise();

  // Handle 404 case when no content is found
  if (!content) {
    return (
      <div>
        <h1>Page Not Found</h1>
        <p>No Builder content found for: /{slug}</p>
      </div>
    );
  }

  // Render the Builder content
  return <Content apiKey={BUILDER_API_KEY} content={content} model="page" />;
}
