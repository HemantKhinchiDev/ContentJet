import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",

          // Variants
          {
            primary:
              "bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary)/0.9)] focus-visible:ring-[rgb(var(--color-primary))]",

            secondary:
              "bg-[rgb(var(--color-secondary))] text-white hover:bg-[rgb(var(--color-secondary)/0.9)] focus-visible:ring-[rgb(var(--color-secondary))]",

            outline:
              "border-2 border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:text-white focus-visible:ring-[rgb(var(--color-primary))]",

            ghost:
              "text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary)/0.1)] focus-visible:ring-[rgb(var(--color-primary))]",
          }[variant],

          // Sizes
          {
            sm: "h-9 px-3 text-sm",
            md: "h-11 px-6 text-base",
            lg: "h-14 px-8 text-lg",
          }[size],

          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button as BaseButton };

