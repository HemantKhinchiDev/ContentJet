import { ContentItem } from "@/app/dashboard/page";
import { ContentItemComponent } from "./content-item";
import { ContentSkeleton } from "./content-skeleton";
import { EmptyContentState } from "./empty-content-state";

interface ContentHistoryProps {
  items: ContentItem[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
}

export function ContentHistory({
  items,
  isLoading,
  onDelete,
  onRetry,
}: ContentHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Section Header Skeleton */}
        <div className="space-y-1">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>

        {/* Content Skeletons */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ContentSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyContentState />;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Recent Content
        </h2>
        <p className="text-sm text-muted-foreground">
          Your latest generated content items
        </p>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {items.map((item) => (
          <ContentItemComponent
            key={item.id}
            item={item}
            onDelete={onDelete}
            onRetry={onRetry}
          />
        ))}
      </div>
    </div>
  );
}