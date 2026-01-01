/**
 * Layout for Ceremonia Year Reflection Page
 *
 * Nested layout that adds Ceremonia brand colors as CSS variables.
 * Note: html/body tags are defined in parent layout at /page/layout.tsx
 */
import type { ReactNode } from 'react';

export const metadata = {
  description:
    "A collective pause to see clearly, release gently, and choose what's next. Designed to be completed in under one hour.",
  openGraph: {
    description: "A collective pause to see clearly, release gently, and choose what's next.",
    title: 'Ceremonia Alumni Year Reflection — Transcend Together',
  },
  robots: { follow: true, index: true },
  title: 'Ceremonia Alumni Year Reflection — Transcend Together',
  twitter: {
    card: 'summary_large_image',
    description: "A collective pause to see clearly, release gently, and choose what's next.",
    title: 'Ceremonia Alumni Year Reflection — Transcend Together',
  },
};

export default function CeremoniaReflectionLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --ceremonia-sol-orange: #FBAE17;
              --ceremonia-corazon-rose: #E31C78;
              --ceremonia-cielo-blue: #6283C2;
              --ceremonia-tierra-teal: #65C5B2;
              --ceremonia-charcoal: #222;
              --ceremonia-charcoal-light: #333;
              --ceremonia-bg: #FAFAFA;
            }
            body {
              background-color: var(--ceremonia-bg);
              color: var(--ceremonia-charcoal);
              font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
              line-height: 1.6;
              margin: 0;
            }
          `,
        }}
      />
      {children}
    </>
  );
}
