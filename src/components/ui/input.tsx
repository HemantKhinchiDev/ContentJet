import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Shows error styling */
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          // Base styles - 40px height per design system
          "flex h-10 w-full rounded-md border bg-background px-3 py-2",
          "text-sm text-foreground",
          "transition-all duration-150",
          
          // Placeholder
          "placeholder:text-muted-foreground",
          
          // Default border
          "border-input",
          
          // Hover state
          "hover:border-muted-foreground/50",
          
          // Focus state - uses design tokens
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "focus-visible:border-primary",
          
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input",
          
          // Error state
          error && [
            "border-destructive",
            "hover:border-destructive",
            "focus-visible:ring-destructive",
            "focus-visible:border-destructive",
          ],
          
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };