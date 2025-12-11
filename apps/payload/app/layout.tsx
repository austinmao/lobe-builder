import type { ReactNode } from 'react';

import './globals.css';

/**
 * Root Layout for Payload CMS
 *
 * IMPORTANT: This layout does NOT render <html> or <body> tags
 * because the nested (payload) layout group uses Payload's RootLayout
 * component which provides its own HTML structure.
 *
 * This prevents hydration errors from nested HTML elements.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
