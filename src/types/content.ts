// src/types/content.ts

/**
 * Content status for generated items
 */
export type ContentStatus = "pending" | "success" | "failed";

/**
 * Content type categories
 */
export type ContentType = "Blog Post" | "Email" | "Social Media" | "Landing Page";

/**
 * Content item interface used across dashboard components
 */
export interface ContentItem {
  id: string;
  title: string;
  type: ContentType | string;
  createdAt: Date;
  status: ContentStatus;
}
