'use client';

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must render its own <html> and <body> because the root layout may be broken.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#f5f5f5',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '1.5rem' }}>
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#c9a84c',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
