/**
 * Builder.io client utilities for multi-tenant content management
 */

import { builder } from "@builder.io/sdk";
import type { PageSpec } from "@lobechat/types";

import type { BuilderContent, BuilderQueryOptions } from "./types";

const BUILDER_API_URL = "https://builder.io/api/v1/write/page";

/**
 * Fetch a page for a specific tenant using MongoDB-style query filtering
 * @param tenantId - The tenant identifier
 * @param slug - The page slug (without leading slash)
 * @param options - Additional query options
 * @returns Builder content or null if not found
 */
export async function getPageForTenant(
	tenantId: string,
	slug: string,
	options?: BuilderQueryOptions,
): Promise<BuilderContent | null> {
	const content = await builder
		.get("page", {
			options: {
				includeUnpublished: options?.includeUnpublished ?? true,
			},
			query: {
				"data.tenantId": tenantId,
				"data.url": `/${slug}`,
			},
		})
		.promise();

	return content as BuilderContent | null;
}

/**
 * Create a page for a specific tenant via Builder.io Write API
 * @param pageSpec - Page specification including tenantId, slug, title, and sections
 * @returns Response from Builder.io API
 * @throws Error if API key is not configured or request fails
 */
export async function createPageForTenant(
	pageSpec: PageSpec,
): Promise<{ id: string }> {
	const privateApiKey = process.env.BUILDER_PRIVATE_API_KEY;

	if (!privateApiKey) {
		throw new Error("BUILDER_PRIVATE_API_KEY is not configured");
	}

	if (!pageSpec.tenantId) {
		throw new Error("tenantId is required for multi-tenant page creation");
	}

	// Convert PageSpec to Builder blocks (import from service layer if needed)
	// For now, this is a placeholder - actual conversion should use pageSpecToBuilderContent
	const blocks: Array<{
		"@type": string;
		component: { name: string; options: unknown };
	}> = [];

	const requestBody = {
		data: {
			blocks,
			tenantId: pageSpec.tenantId,
			url: `/${pageSpec.slug}`,
		},
		name: pageSpec.title,
		published: "draft" as const,
	};

	const response = await fetch(BUILDER_API_URL, {
		body: JSON.stringify(requestBody),
		headers: {
			Authorization: `Bearer ${privateApiKey}`,
			"Content-Type": "application/json",
		},
		method: "POST",
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to create page: ${errorText}`);
	}

	return response.json();
}

/**
 * Query multiple pages for a specific tenant
 * @param tenantId - The tenant identifier
 * @param options - Additional query options
 * @returns Array of Builder content matching the query
 */
export async function getAllPagesForTenant(
	tenantId: string,
	options?: BuilderQueryOptions,
): Promise<BuilderContent[]> {
	const contents = await builder.getAll("page", {
		limit: options?.limit,
		offset: options?.offset,
		options: {
			includeUnpublished: options?.includeUnpublished ?? true,
		},
		query: {
			"data.tenantId": tenantId,
		},
	});

	return contents as BuilderContent[];
}
