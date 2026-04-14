export interface BookmarkItem {
  id: string;
  title: string;
  url?: string;
  parentId?: string;
  dateAdded?: number;
  children?: BookmarkItem[];
  type?: "bookmark" | "folder" | "reminder" | "note" | "quicklink" | "watchlist" | "mostvisited";
  description?: string;
  deadline?: string;
  customAdded?: boolean;
}
