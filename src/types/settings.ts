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
  backgroundType?: "image" | "solid" | "gradient";
  backgroundImage?: string;
  backgroundGradient?: string;
  backgroundOpacity?: number;
  backgroundBlur?: number;
  cardOpacity?: number;
  cardBlur?: number;
  textBrightness?: number;
  textColor?: string;
  backgroundColor?: string;
  cardBackgroundColor?: string;
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
  backgroundType: "image",
  backgroundImage: "",
  backgroundGradient: "linear-gradient(to bottom right, #4f46e5, #9333ea)",
  backgroundOpacity: 50,
  backgroundBlur: 0,
  cardOpacity: 60,
  cardBlur: 16,
  textBrightness: 100,
  textColor: "#e2e8f0", // Default text-primary
  backgroundColor: "#1a1c23", // Default bg-color
  cardBackgroundColor: "#1e293b", // Default color for cards (slate-800)
};
