/**
 * Builder.io related types for landing page generation
 */

export interface PageSpecSection {
	[key: string]: unknown;
	type: "hero" | "text" | "cta" | "features";
}

export interface PageSpec {
	sections: PageSpecSection[];
	slug: string;
	tenantId: string;
	title: string;
}

export interface BuilderBlock {
	"@type": string;
	component: {
		name: string;
		options: Record<string, unknown>;
	};
}
