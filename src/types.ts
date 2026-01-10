export interface Settings {
  theme: "dark" | "light";
  sidebarCollapsed: boolean;
  viewMode: "feed" | "tabs";
  activeTab: string;
  activeBoardId: string;
  activeSidebarItem: string;
  boards: { id: string; name: string }[];
  collapsedSections: string[];
  clockMode: "analog" | "digital";
  gridMode?: "horizontal" | "vertical";
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundBlur?: number;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  sidebarCollapsed: false,
  viewMode: "feed",
  activeTab: "tabs",
  activeBoardId: "1",
  activeSidebarItem: "dashboard",
  boards: [{ id: "1", name: "Bookmark" }],
  collapsedSections: [],
  clockMode: "digital",
  gridMode: "horizontal",
  backgroundImage: "",
  backgroundOpacity: 50,
  backgroundBlur: 0,
};

export interface BookmarkItem {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
  children?: BookmarkItem[];
  parentId?: string;
  type?: "bookmark" | "folder" | "reminder" | "note";
  description?: string;
  deadline?: string;
}
