/**
 * Not Found page for tenant landing page previews
 *
 * Displayed when:
 * - Tenant doesn't exist
 * - Page doesn't exist for tenant
 */

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
      <p className="mb-8 text-lg text-gray-600">Preview not found</p>
      <p className="text-sm text-gray-500">
        The page you&apos;re trying to preview doesn&apos;t exist.
      </p>
    </div>
  );
}
