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
        className="hidden lg:flex lg:flex-1 lg:max-w-[55%] items-center justify-center relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Base layer - deep dark foundation */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, hsl(240 6% 6%), hsl(240 5% 4%), hsl(240 4% 3%))`,
          }}
        />

        {/* Depth layer - subtle ambient glow zones */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 10% 0%, rgba(99, 102, 241, 0.08), transparent 50%),
              radial-gradient(ellipse 60% 80% at 100% 100%, rgba(124, 58, 237, 0.06), transparent 50%),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(71, 85, 105, 0.04), transparent 60%)
            `,
          }}
        />

        {/* Accent layer - soft edge highlights */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to right, rgba(255, 255, 255, 0.01) 0%, transparent 5%),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.03) 0%, transparent 30%),
              linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 20%)
            `,
          }}
        />

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Dot grid texture - refined */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.5) 0.5px, transparent 0.5px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Content container */}
        <div className="relative z-10 max-w-lg px-16 text-center">
          {/* ContentJet brand mark */}
          <div className="mb-12 inline-block">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-8 blur-3xl opacity-30 bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-indigo-500/30" />
              
              {/* Logo container */}
              <div className="relative">
                <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-white/[0.08] flex items-center justify-center shadow-2xl shadow-black/50">
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