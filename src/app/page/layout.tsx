/**
 * Root Layout for Tenant Landing Pages
 *
 * Minimal layout for landing pages rendered outside the main LobeChat app.
 * These pages are served at /page/[tenant]/[slug] for published pages.
 */
import { ReactNode } from 'react';

export const metadata = {
  description: 'Landing Pages',
  title: 'Landing Page',
};

export default function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Base landing page styles */
              :root,
              .light-mode {
                /* Brand Colors */
                --color-brand-500: #0ea5e9;
                --color-brand-600: #0284c7;

                /* Text Colors */
                --color-text-primary: #101828;
                --color-text-secondary: #475467;
                --color-text-tertiary: #667085;

                /* Background Colors */
                --color-bg-primary: #ffffff;
                --color-bg-secondary: #f9fafb;
                --color-bg-tertiary: #f2f4f7;

                /* Border Colors */
                --color-border-primary: #e4e7ec;
                --color-border-secondary: #eaecf0;

                /* Error Colors */
                --color-error-500: #f04438;
                --color-error-600: #d92d20;

                /* Success Colors */
                --color-success-500: #12b76a;

                /* Shadows */
                --shadow-xs: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
                --shadow-sm: 0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px -1px rgba(16, 24, 40, 0.1);
                --shadow-md: 0px 4px 6px -1px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.1);
                --shadow-lg: 0px 10px 15px -3px rgba(16, 24, 40, 0.1), 0px 4px 6px -4px rgba(16, 24, 40, 0.1);
                --shadow-xl: 0px 20px 25px -5px rgba(16, 24, 40, 0.1), 0px 8px 10px -6px rgba(16, 24, 40, 0.1);
              }

              body {
                margin: 0;
                font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
                line-height: 1.5;
                color: var(--color-text-primary);
                background-color: var(--color-bg-primary);
              }

              * {
                box-sizing: border-box;
              }
            `,
          }}
        />
      </head>
      <body className="light-mode">{children}</body>
    </html>
  );
}
