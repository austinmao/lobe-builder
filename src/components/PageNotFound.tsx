/**
 * PageNotFound Component
 *
 * Simple 404 page component for when a page is not found.
 * Displays a user-friendly message with a link to return home.
 */
import Link from 'next/link';

export function PageNotFound() {
  return (
    <div className="page-not-found">
      <h1 className="title">404 - Page Not Found</h1>
      <p className="message">The page you are looking for does not exist or has been removed.</p>
      <Link className="home-link" href="/">
        Go back to home
      </Link>

      <style jsx>{`
        .page-not-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
          background: var(--color-bg-primary, #ffffff);
        }

        .title {
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-text-primary, #1a1a1a);
          margin: 0 0 1rem 0;
        }

        .message {
          font-size: 1.125rem;
          color: var(--color-text-secondary, #6b7280);
          margin: 0 0 2rem 0;
          max-width: 500px;
        }

        .home-link {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: var(--color-brand-500, #6366f1);
          color: white;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .home-link:hover {
          background: var(--color-brand-600, #4f46e5);
        }

        .home-link:focus-visible {
          outline: 2px solid var(--color-brand-500, #6366f1);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
