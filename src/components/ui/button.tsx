import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant = "primary", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
        variant === "primary" &&
          "bg-black text-white hover:bg-black/90",
        variant === "outline" &&
          "border border-gray-300 bg-white text-black hover:bg-gray-50",
        className
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";
