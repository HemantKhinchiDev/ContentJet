import * as React from "react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Ambient gradient background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 20% 10%, rgba(99, 102, 241, 0.06), transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.04), transparent 40%),
            hsl(var(--background))
          `,
        }}
        aria-hidden="true"
      />

      {/* Left side: Auth form area */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12 relative">
        <div className="w-full max-w-[420px] relative z-10">
          {children}
        </div>
      </main>

      {/* Right side: Premium ambient panel (desktop only) */}
      <aside
        className="hidden lg:flex lg:flex-1 lg:max-w-[55%] items-center justify-center relative overflow-hidden bg-zinc-950"
        aria-hidden="true"
      >
        {/* Gradient base */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.12), transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.08), transparent 50%),
              linear-gradient(to bottom, hsl(240 10% 4%), hsl(240 10% 3%))
            `,
          }}
        />

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Content container */}
        <div className="relative z-10 max-w-lg px-16 text-center">
          {/* ContentJet brand mark */}
          <div className="mb-12 inline-block">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-8 blur-3xl opacity-40 bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-indigo-500/40" />
              
              {/* Logo container */}
              <div className="relative">
                <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl">
                  <span className="text-4xl font-bold bg-gradient-to-br from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                    CJ
                  </span>
                </div>
                
                {/* Brand name */}
                <div className="mt-6 text-2xl font-semibold text-white tracking-tight">
                  ContentJet
                </div>
              </div>
            </div>
          </div>

          {/* Value proposition */}
          <h2 className="text-3xl font-semibold text-white leading-tight mb-4">
            AI-powered content
            <br />
            <span className="text-indigo-400">at scale.</span>
          </h2>

          <p className="text-zinc-400 text-base leading-relaxed">
            Create, manage, and publish content faster than ever before.
          </p>
        </div>
      </aside>
    </div>
  );
}