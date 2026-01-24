import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          // Base styles
          "flex h-11 w-full rounded-[var(--radius-md)] border bg-[rgb(var(--color-surface))] px-4 py-2 text-base transition-colors",
          "placeholder:text-[rgb(var(--color-muted))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[rgb(var(--color-muted)/0.15)]",

          // States
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-[rgb(var(--color-border))] focus-visible:border-[rgb(var(--color-primary))] focus-visible:ring-[rgb(var(--color-primary))]",

          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
