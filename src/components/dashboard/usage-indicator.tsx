import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface UsageIndicatorProps {
  used: number;
  limit: number;
  isPro?: boolean;
}

export function UsageIndicator({
  used,
  limit,
  isPro = false,
}: UsageIndicatorProps) {
  if (isPro) {
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary">
        Pro Plan
      </Badge>
    );
  }

  const percentage = Math.min((used / limit) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end">
        <p className="text-xs text-muted-foreground">Usage this month</p>
        <p className="text-sm font-medium text-foreground">
          {used} / {limit}
        </p>
      </div>
      <Progress value={percentage} className="w-20" />
      <span className="text-xs font-medium text-muted-foreground sm:hidden">
        {used}/{limit}
      </span>
    </div>
  );
}