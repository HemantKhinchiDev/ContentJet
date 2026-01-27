"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OAuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Provider name for accessibility */
  provider: string;
  /** Provider icon component */
  icon: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

const OAuthButton = React.forwardRef<HTMLButtonElement, OAuthButtonProps>(
  (
    {
      className,
      provider,
      icon,
      loading = false,
      fullWidth = true,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant="secondary"
        size="default"
        fullWidth={fullWidth}
        disabled={disabled || loading}
        aria-label={`Continue with ${provider}`}
        className={cn(
          // OAuth-specific hover enhancement
          "hover:bg-muted/80",
          className
        )}
        {...props}
      >
        {/* Provider icon */}
        {loading ? (
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <span className="h-5 w-5 flex items-center justify-center">
            {icon}
          </span>
        )}

        {/* Button text */}
        <span>
          {loading ? "Connecting..." : children || `Continue with ${provider}`}
        </span>
      </Button>
    );
  }
);

OAuthButton.displayName = "OAuthButton";

export { OAuthButton };