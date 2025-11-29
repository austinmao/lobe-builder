/**
 * Multi-tenant Builder.io type definitions
 */

import type { BuilderBlock, PageSpec, PageSpecSection } from "@lobechat/types";

// Re-export types from @lobechat/types for convenience
export type { BuilderBlock, PageSpec, PageSpecSection };

/**
 * Response from Builder.io Content API
 */
export interface BuilderContent {
	data: {
		blocks?: BuilderBlock[];
		tenantId?: string;
		url?: string;
		[key: string]: unknown;
	};
	id: string;
	name: string;
	published?: "draft" | "published" | "archived";
}

/**
 * Options for querying Builder.io content
 */
export interface BuilderQueryOptions {
	cacheSeconds?: number;
	includeUnpublished?: boolean;
	limit?: number;
	offset?: number;
	staleCacheSeconds?: number;
}
