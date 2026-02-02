"use client";

import { MoreHorizontal, Copy, Download, Trash2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContentItem } from "@/types/content";
import { StatusBadge } from "./status-badge";
import { formatRelativeDate } from "@/lib/utils";

interface ContentItemProps {
  item: ContentItem;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
}

export function ContentItemComponent({
  item,
  onDelete,
  onRetry,
}: ContentItemProps) {
  return (
    <Card className="group border border-border bg-card p-4 transition-colors hover:bg-accent/50">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-foreground">
              {item.title}
            </h3>
            <StatusBadge status={item.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded bg-muted px-1.5 py-0.5">{item.type}</span>
            <span>•</span>
            <span>{formatRelativeDate(item.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.status === "failed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(item.id)}
              className="h-8 gap-1.5 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem disabled={item.status !== "success"}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem disabled={item.status !== "success"}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}