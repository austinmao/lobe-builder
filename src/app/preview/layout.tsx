/**
 * Root Layout for Preview Pages
 *
 * Minimal layout for preview pages rendered outside the main LobeChat app.
 * These pages are served at /preview/[tenant]/[slug] for draft pages.
 */
import { ReactNode } from 'react';

import '@/styles/untitled-ui-theme.css';

export const metadata = {
  description: 'Page Preview',
  robots: {
    follow: false,
    index: false,
  },
  title: 'Preview',
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="light-mode">{children}</body>
    </html>
  );
}
