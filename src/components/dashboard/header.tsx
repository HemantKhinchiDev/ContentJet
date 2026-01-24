"use client";

import { CreateProjectCTA } from "../projects/create-project-cta";


export default function Header() {
  return (
    <header className="h-16 border-b px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* Single source of truth for Create Project */}
      <CreateProjectCTA />
    </header>
  );
}
