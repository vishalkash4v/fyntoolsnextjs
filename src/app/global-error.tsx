'use client';

/**
 * Global error boundary — must define its own <html>/<body>.
 * Meta description is set via a real <meta> tag for the local SEO audit.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Something Went Wrong | FYN Tools</title>
        <meta
          name="description"
          content="FYN Tools hit an unexpected error. Try again, or return to the free online tools homepage."
        />
        <meta name="robots" content="noindex, follow" />
      </head>
      <body className="min-h-screen flex flex-col items-center justify-center p-8 font-sans">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-zinc-600 mb-6 max-w-md text-center">
          {error.message || 'Unexpected error while loading this page.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-md bg-zinc-900 text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
