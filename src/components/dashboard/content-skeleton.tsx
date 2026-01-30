import { Card } from "@/components/ui/card";

export function ContentSkeleton() {
  return (
    <Card className="border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-3 rounded-full bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
      </div>
    </Card>
  );
}