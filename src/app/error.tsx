'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-6">{error.message || 'Unexpected error'}</p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
