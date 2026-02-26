"use client";

import { useUsage } from "@/context/UsageContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const FREE_TIER_LIMIT = 50;

interface UsageIndicatorProps {
  isPro?: boolean;
}

export function UsageIndicator({ isPro = false }: UsageIndicatorProps) {
  const { count = 0 } = useUsage() ?? {};

  if (isPro) {
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary">
        Pro Plan
      </Badge>
    );
  }

  const percentage = Math.min(((count ?? 0) / FREE_TIER_LIMIT) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end">
        <p className="text-xs text-muted-foreground">Usage this month</p>
        <p className="text-sm font-medium text-foreground">
          {count} / {FREE_TIER_LIMIT}
        </p>
      </div>
      <Progress value={percentage} className="w-20" />
      <span className="text-xs font-medium text-muted-foreground sm:hidden">
        {count}/{FREE_TIER_LIMIT}
      </span>
    </div>
  );
}