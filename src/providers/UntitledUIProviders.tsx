/**
 * UntitledUIProviders
 *
 * Provides the necessary context providers for Untitled UI components
 * in the landing page builder preview routes.
 *
 * Includes:
 * - RouterProvider from react-aria-components for navigation
 * - ThemeProvider from next-themes for theme switching
 */

'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { RouterProvider } from 'react-aria-components';

/**
 * UntitledUIProviders
 *
 * Provides the necessary context providers for Untitled UI components
 * in the landing page builder preview routes.
 *
 * Includes:
 * - RouterProvider from react-aria-components for navigation
 * - ThemeProvider from next-themes for theme switching
 */

/**
 * UntitledUIProviders
 *
 * Provides the necessary context providers for Untitled UI components
 * in the landing page builder preview routes.
 *
 * Includes:
 * - RouterProvider from react-aria-components for navigation
 * - ThemeProvider from next-themes for theme switching
 */

interface UntitledUIProvidersProps {
  children: ReactNode;
}

export function UntitledUIProviders({ children }: UntitledUIProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableColorScheme={true}
      enableSystem={true}
      themes={['light', 'dark']}
      value={{
        dark: 'dark-mode',
        light: 'light-mode',
      }}
    >
      <RouterProvider navigate={(href) => (window.location.href = href)}>{children}</RouterProvider>
    </ThemeProvider>
  );
}
