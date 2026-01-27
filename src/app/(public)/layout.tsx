import * as React from "react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Subtle gradient background for entire page */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, rgba(120, 119, 198, 0.05), transparent),
            linear-gradient(to bottom, hsl(var(--background)), hsl(var(--background)))
          `,
        }}
        aria-hidden="true"
      />

      {/* Left side: Auth form area */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12 relative">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
          aria-hidden="true"
        />
        
        <div className="w-full max-w-[400px] relative z-10">
          {children}
        </div>
      </main>

      {/* Right side: Ambient panel (desktop only) */}
      <aside
        className="hidden lg:flex lg:flex-1 lg:max-w-[50%] items-center justify-center relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Dark gradient base */}
        <div 
          className="absolute inset-0 bg-zinc-950"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(240 10% 8%) 0%, 
                hsl(240 10% 6%) 50%,
                hsl(240 10% 4%) 100%
              )
            `,
          }}
        />

        {/* Ambient glow orbs */}
        <div 
          className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)",
          }}
        />
        <div 
          className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.12), transparent 70%)",
          }}
        />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Centered content */}
        <div className="relative z-10 max-w-md px-12 text-center">
          {/* ContentJet Logo Mark */}
          <div className="mx-auto mb-10 relative">
            {/* Glow behind logo */}
            <div className="absolute inset-0 blur-2xl opacity-50 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl scale-150" />
            
            {/* Logo container */}
            <div className="relative h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl">
              {/* CJ Monogram */}
              <span className="text-3xl font-bold bg-gradient-to-br from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                CJ
              </span>
            </div>
          </div>

          {/* Brand statement */}
          <h2 className="text-3xl font-semibold text-white leading-tight tracking-tight">
            Content that
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              converts.
            </span>
          </h2>

          {/* Subtle supporting text */}
          <p className="mt-6 text-base text-zinc-400 leading-relaxed">
            AI-powered content creation for modern teams.
          </p>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">10K+</div>
              <div className="text-xs text-zinc-500 mt-1">Users</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">1M+</div>
              <div className="text-xs text-zinc-500 mt-1">Content pieces</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">99.9%</div>
              <div className="text-xs text-zinc-500 mt-1">Uptime</div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
      </aside>
    </div>
  );
}