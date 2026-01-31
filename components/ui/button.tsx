import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Base styles
    "inline-flex items-center justify-center gap-2",
    "rounded-md text-sm font-medium",
    "transition-all duration-150",
    // Focus styles (leverages globals.css focus-visible)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Disabled styles
    "disabled:pointer-events-none disabled:opacity-50",
    // Active micro-interaction
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        // Primary: solid fill, main CTA
        primary: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
        ],
        // Secondary: outlined, for OAuth and secondary actions
        secondary: [
          "border border-border bg-background text-foreground",
          "hover:bg-muted",
        ],
        // Outline: alias for secondary (shadcn compatibility)
        outline: [
          "border border-border bg-background text-foreground",
          "hover:bg-muted",
        ],
        // Ghost: minimal, for tertiary actions
        ghost: [
          "text-foreground",
          "hover:bg-muted",
        ],
        // Destructive: for dangerous actions
        destructive: [
          "bg-destructive text-white",
          "hover:bg-destructive/90",
        ],
        // Link: text-only button
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ],
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Icon element to render before children */
  leftIcon?: React.ReactNode;
  /** Icon element to render after children */
  rightIcon?: React.ReactNode;
  /** Radix UI Slot compatibility - not used in this component but prevents prop leakage */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      asChild,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Note: asChild is accepted but ignored in this implementation
    // It's destructured here to prevent it from reaching the DOM element

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
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
          leftIcon
        )}

        {/* Button text */}
        {loading ? "Loading..." : children}

        {/* Right icon (hidden when loading) */}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };