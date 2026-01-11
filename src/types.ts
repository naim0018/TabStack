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
  cardOpacity?: number;
  textBrightness?: number;
  textColor?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  sidebarCollapsed: false,
  activeBoardId: "1",
  activeSidebarItem: "dashboard",
  activeTab: "tabs",
  clockMode: "digital",
  boards: [],
  collapsedSections: [],
  viewMode: "feed",
  backgroundImage: "",
  backgroundOpacity: 50,
  backgroundBlur: 0,
  cardOpacity: 60,
  textBrightness: 100,
  textColor: "#e2e8f0", // Default text-primary
};

export interface BookmarkItem {
  id: string;
  title: string;
  url?: string;
  parentId?: string;
  dateAdded?: number;
  children?: BookmarkItem[];
  type?: "bookmark" | "folder" | "reminder" | "note" | "quicklink";
  description?: string;
  deadline?: string;
}
