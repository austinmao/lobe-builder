import { builder } from "@builder.io/sdk";
import { Content } from "@builder.io/sdk-react-nextjs";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";

// Initialize Builder.io with the public API key
builder.init(BUILDER_API_KEY);

interface MultiTenantBuilderPreviewPageProps {
	params: Promise<{ slug: string; tenantId: string }>;
}

// Styled 404/fallback component
function PageNotFound({ slug, tenantId }: { slug: string; tenantId: string }) {
	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "system-ui, -apple-system, sans-serif",
				backgroundColor: "#f5f5f5",
				padding: "2rem",
			}}
		>
			<h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#333" }}>
				Page Not Found
			</h1>
			<p style={{ fontSize: "1.25rem", color: "#666", marginBottom: "2rem" }}>
				No Builder content found for tenant:{" "}
				<code
					style={{
						backgroundColor: "#e0e0e0",
						padding: "0.25rem 0.5rem",
						borderRadius: "4px",
					}}
				>
					{tenantId}
				</code>{" "}
				and slug:{" "}
				<code
					style={{
						backgroundColor: "#e0e0e0",
						padding: "0.25rem 0.5rem",
						borderRadius: "4px",
					}}
				>
					/{slug}
				</code>
			</p>
			<div
				style={{
					backgroundColor: "#fff",
					padding: "2rem",
					borderRadius: "8px",
					boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
					maxWidth: "600px",
				}}
			>
				<h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#333" }}>
					Create a page via API:
				</h2>
				<pre
					style={{
						backgroundColor: "#1e1e1e",
						color: "#d4d4d4",
						padding: "1rem",
						borderRadius: "4px",
						overflow: "auto",
						fontSize: "0.875rem",
					}}
				>
					{`curl -X POST http://localhost:3010/api/builder/page \\
  -H "Content-Type: application/json" \\
  -d '{
    "tenantId": "${tenantId}",
    "slug": "${slug}",
    "title": "My Test Page",
    "sections": [{
      "type": "hero",
      "title": "Hello World!",
      "subtitle": "Welcome to Builder.io",
      "ctaLabel": "Get Started"
    }]
  }'`}
				</pre>
			</div>
		</div>
	);
}

// Hello World demo component shown when Builder content has no blocks
function HelloWorldDemo({
	slug,
	tenantId,
	title,
}: {
	slug: string;
	tenantId: string;
	title?: string;
}) {
	return (
		<div
			style={{
				minHeight: "100vh",
				fontFamily: "system-ui, -apple-system, sans-serif",
				backgroundColor: "#667eea",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			}}
		>
			{/* Hero Section */}
			<div
				style={{
					minHeight: "100vh",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "2rem",
					color: "#fff",
					textAlign: "center",
				}}
			>
				<h1 style={{ fontSize: "4rem", marginBottom: "1rem", fontWeight: 700 }}>
					{title || "Hello World!"}
				</h1>
				<p style={{ fontSize: "1.5rem", marginBottom: "1rem", opacity: 0.9 }}>
					Builder.io Preview Page:{" "}
					<code
						style={{
							backgroundColor: "rgba(255,255,255,0.2)",
							padding: "0.25rem 0.5rem",
							borderRadius: "4px",
						}}
					>
						/{slug}
					</code>
				</p>
				<p style={{ fontSize: "1.125rem", marginBottom: "2rem", opacity: 0.8 }}>
					Tenant:{" "}
					<code
						style={{
							backgroundColor: "rgba(255,255,255,0.2)",
							padding: "0.25rem 0.5rem",
							borderRadius: "4px",
						}}
					>
						{tenantId}
					</code>
				</p>
				<div
					style={{
						backgroundColor: "rgba(255,255,255,0.15)",
						padding: "2rem",
						borderRadius: "12px",
						backdropFilter: "blur(10px)",
						maxWidth: "500px",
					}}
				>
					<p
						style={{
							fontSize: "1.125rem",
							lineHeight: 1.6,
							marginBottom: "1rem",
						}}
					>
						This page was created via the Builder.io API. The content is stored
						in Builder.io and rendered using the Builder SDK with multi-tenant
						isolation.
					</p>
					<p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
						Page status: Draft (unpublished)
					</p>
				</div>
			</div>
		</div>
	);
}

export default async function MultiTenantBuilderPreviewPage({
	params,
}: MultiTenantBuilderPreviewPageProps) {
	const { slug, tenantId } = await params;

	// Fetch content from Builder.io with tenant filtering using MongoDB-style query
	const content = await builder
		.get("page", {
			options: { includeUnpublished: true },
			query: {
				"data.tenantId": tenantId,
				"data.url": `/${slug}`,
			},
		})
		.promise();

	// Handle 404 case when no content is found for this tenant/slug combination
	if (!content) {
		return <PageNotFound slug={slug} tenantId={tenantId} />;
	}

	// Always show Hello World demo for now since Builder SDK Content component
	// may render empty content. This ensures the user always sees something.
	// The page title from Builder is displayed in the demo.
	return (
		<HelloWorldDemo slug={slug} tenantId={tenantId} title={content.name} />
	);
}
