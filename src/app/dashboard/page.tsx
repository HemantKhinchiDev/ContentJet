"use client";

import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { ContentHistory } from "@/components/dashboard/content-history";
import { DeleteToast } from "@/components/dashboard/delete-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ✅ Types moved OUT of page.tsx (important for production build)
import { ContentItem } from "@/types/content";

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
  const [inputValue, setInputValue] = useState("");

  const handleDelete = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setDeletedItem(item);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setShowToast(true);
  };

  const handleUndo = () => {
    if (!deletedItem) return;

    setItems((prev) =>
      [...prev, deletedItem].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )
    );
    setDeletedItem(null);
    setShowToast(false);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    console.log("Generate content:", inputValue);

    setInputValue("");

    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setInputValue(target.value);

    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-full py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <header className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Your Content
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and view all your generated content
            </p>
          </header>

          {/* Input composer */}
          <div className="relative">
            <div className="flex items-end gap-2 rounded-3xl border border-border bg-background pl-4 pr-2 py-3 shadow-sm transition-all has-[:focus]:border-primary/50 has-[:focus]:ring-4 has-[:focus]:ring-primary/10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex-shrink-0 self-end pb-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
                    aria-label="Add attachment"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  <p>Add attachment</p>
                </TooltipContent>
              </Tooltip>

              <textarea
                value={inputValue}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="What would you like to create today?"
                rows={1}
                className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 min-h-[28px] border-0 outline-0 focus:ring-0"
                style={{ maxHeight: "200px" }}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-all hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground/40 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <section className="space-y-4 pt-4">
            <ContentHistory
              items={items}
              isLoading={isLoading}
              onDelete={handleDelete}
            />
          </section>
        </div>

        <DeleteToast
          isVisible={showToast}
          onUndo={handleUndo}
          onClose={() => setShowToast(false)}
        />
      </div>
    </TooltipProvider>
  );
}
