import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyContentState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">
        No content generated yet
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating your first piece of content.
      </p>
      <Button className="mt-6" size="sm">
        Generate your first content
      </Button>
    </div>
  );
}