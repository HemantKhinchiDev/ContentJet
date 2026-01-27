import * as React from "react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side: Auth form area */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </main>

      {/* Right side: Ambient panel (desktop only) */}
      <aside
        className="hidden lg:flex lg:flex-1 lg:max-w-[50%] bg-muted/30 items-center justify-center relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Centered content */}
        <div className="relative z-10 max-w-md px-12 text-center">
          {/* Abstract geometric shape */}
          <div className="mx-auto mb-8 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary/20" />
          </div>

          {/* Single powerful statement */}
          <h2 className="text-2xl font-semibold text-foreground/80 leading-relaxed">
            Build faster.
            <br />
            Scale smarter.
          </h2>

          {/* Subtle supporting text */}
          <p className="mt-4 text-sm text-muted-foreground">
            The modern foundation for your next great product.
          </p>
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/20 pointer-events-none" />
      </aside>
    </div>
  );
}