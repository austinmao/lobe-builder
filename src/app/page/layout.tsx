/**
 * Root Layout for Tenant Landing Pages
 *
 * Minimal layout for landing pages rendered outside the main LobeChat app.
 * These pages are served at /page/[tenant]/[slug] for published pages.
 */
import { ReactNode } from 'react';

import '@/styles/untitled-ui-theme.css';

export const metadata = {
  description: 'Landing Pages',
  title: 'Landing Page',
};

export default function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="light-mode">{children}</body>
    </html>
  );
}
