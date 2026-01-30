"use client";

import { useState } from "react";
import { ContentHistory } from "@/components/dashboard/content-history";
import { DeleteToast } from "@/components/dashboard/delete-toast";

export type ContentStatus = "pending" | "success" | "failed";

export interface ContentItem {
  id: string;
  title: string;
  type: string;
  createdAt: Date;
  status: ContentStatus;
}

const mockContentItems: ContentItem[] = [
  {
    id: "1",
    title: "10 AI Marketing Strategies for 2024",
    type: "Blog Post",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    status: "success",
  },
  {
    id: "2",
    title: "Product Launch Email Campaign",
    type: "Email",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    status: "pending",
  },
  {
    id: "3",
    title: "Instagram Post: Spring Collection",
    type: "Social Media",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "success",
  },
  {
    id: "4",
    title: "SEO Landing Page Copy",
    type: "Landing Page",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: "failed",
  },
];

export default function DashboardPage() {
  const [items, setItems] = useState<ContentItem[]>(mockContentItems);
  const [deletedItem, setDeletedItem] = useState<ContentItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isLoading] = useState(false);

  const handleDelete = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setDeletedItem(item);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setShowToast(true);
    }
  };

  const handleUndo = () => {
    if (deletedItem) {
      setItems((prev) =>
        [...prev, deletedItem].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      );
      setDeletedItem(null);
      setShowToast(false);
    }
  };

  const handleRetry = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "pending" as const } : item
      )
    );

    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "success" as const } : item
        )
      );
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Your Content
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage and view all your generated content
        </p>
      </div>

      <div className="h-px bg-border" />

      <ContentHistory
        items={items}
        isLoading={isLoading}
        onDelete={handleDelete}
        onRetry={handleRetry}
      />

      <DeleteToast
        isVisible={showToast}
        onUndo={handleUndo}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}