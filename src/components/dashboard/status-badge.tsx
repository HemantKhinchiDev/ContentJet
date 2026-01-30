import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContentStatus } from "@/app/dashboard/page";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ContentStatus;
}

const statusConfig: Record<
  ContentStatus,
  { label: string; className: string; showSpinner?: boolean }
> = {
  pending: {
    label: "Generating…",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500",
    showSpinner: true,
  },
  success: {
    label: "Ready",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500",
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1 border-0",
        config.className
      )}
    >
      {config.showSpinner && <Loader2 className="h-3 w-3 animate-spin" />}
      {config.label}
    </Badge>
  );
}