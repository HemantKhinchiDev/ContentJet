// src/app/auth/error/page.tsx

import Link from 'next/link';

/**
 * Auth Error Page
 * 
 * Displays authentication errors from:
 * - Failed email verification
 * - OAuth errors (user denied, provider issues)
 * - Code exchange failures
 */

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  
  const error = (params.error as string) || 'unknown_error';
  const errorDescription = 
    (params.error_description as string) || 
    'An error occurred during authentication. Please try again.';

  // Map error codes to user-friendly titles
  const errorTitles: Record<string, string> = {
    missing_code: 'Invalid Link',
    exchange_failed: 'Verification Failed',
    no_session: 'Session Error',
    access_denied: 'Access Denied',
    unexpected_error: 'Something Went Wrong',
    unknown_error: 'Authentication Error',
  };

  const title = errorTitles[error] || errorTitles.unknown_error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-3">
          {title}
        </h1>

        {/* Error Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {errorDescription}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Login
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Create New Account
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          If this problem persists, please{' '}
          <Link href="/help" className="text-primary hover:underline">
            contact support
          </Link>
          .
        </p>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-left">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Debug Information
            </p>
            <pre className="text-xs font-mono text-muted-foreground overflow-auto">
              {JSON.stringify({ error, errorDescription }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}