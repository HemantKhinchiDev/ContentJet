import * as React from "react";
import { cn } from "@/lib/utils";

interface AuthDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text to display in the divider */
  text?: string;
}

const AuthDivider = React.forwardRef<HTMLDivElement, AuthDividerProps>(
  ({ className, text = "Or continue with", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn("relative flex items-center w-full", className)}
        {...props}
      >
        {/* Left line */}
        <div className="flex-1 h-px bg-border" aria-hidden="true" />

        {/* Center text */}
        <span className="px-4 text-xs text-muted-foreground bg-background">
          {text}
        </span>

        {/* Right line */}
        <div className="flex-1 h-px bg-border" aria-hidden="true" />
      </div>
    );
  }
);

AuthDivider.displayName = "AuthDivider";

export { AuthDivider };