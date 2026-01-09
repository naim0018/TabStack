import React, { useEffect, useState, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Card, CardItem } from "./components/Card";
import { EditModal, EditData } from "./components/EditModal";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { chromeApi } from "./utils/chrome";
import {
  ChevronDown,
  Clock,
  LayoutGrid,
  AlertCircle,
  Info,
  Edit2,
  Trash2,
  Bell,
  Plus,
  Folder,
  FileText,
} from "lucide-react";

// Settings interface
interface Settings {
  theme: "dark" | "light";
  sidebarCollapsed: boolean;
  viewMode: "feed" | "tabs";
  activeTab: string;
  activeBoardId: string;
  activeSidebarItem: string;
  boards: { id: string; name: string }[];
  collapsedSections: string[];
}

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  sidebarCollapsed: false,
  viewMode: "feed",
  activeTab: "tabs",
  activeBoardId: "1",
  activeSidebarItem: "spaces",
  boards: [{ id: "1", name: "Bookmark" }],
  collapsedSections: [],
};

const App = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [tree, setTree] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [topSites, setTopSites] = useState<chrome.topSites.MostVisitedURL[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(Date.now());
  const [notesFolderId, setNotesFolderId] = useState<string | null>(null);
  const [remindersFolderId, setRemindersFolderId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal & Confirmation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<EditData | null>(
    null
  );
  const [modalForceType, setModalForceType] = useState<
    "bookmark" | "folder" | "reminder" | "note" | null
  >(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Drag State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const isMoving = React.useRef(false);

  // Load Data
  const refreshData = async () => {
    if (isMoving.current) return;
    try {
      const [t, tr, m, ts] = await Promise.all([
        chromeApi.getTabs(),
        chromeApi.getTree(),
        chromeApi.getMetadata(),
        chromeApi.getTopSites(),
      ]);
      setTabs(t);
      setTree(tr);
      setMetadata(m);
      setTopSites(ts.slice(0, 10));

      // Find or Create Notes Folder
      let notesId: string | null = null;
      const findNotesFolder = (nodes: any[]): any => {
        for (let n of nodes) {
          if (n.title === "TabStack Notes" && !n.url) return n;
          if (n.children) {
            const f = findNotesFolder(n.children);
            if (f) return f;
          }
        }
        return null;
      };
      const notesFolder = findNotesFolder(tr);
      if (notesFolder) {
        notesId = notesFolder.id;
      } else {
        // Create it in Root (usually '1' is the Bookmarks Bar)
        const created = await chromeApi.createBookmark({
          parentId: "1",
          title: "TabStack Notes",
        });
        notesId = created.id;
      }
      setNotesFolderId(notesId);

      // Find or Create Reminders Folder
      let remId: string | null = null;
      const findRemindersFolder = (nodes: any[]): any => {
        for (let n of nodes) {
          if (n.title === "TabStack Reminders" && !n.url) return n;
          if (n.children) {
            const f = findRemindersFolder(n.children);
            if (f) return f;
          }
        }
        return null;
      };
      const remFolder = findRemindersFolder(tr);
      if (remFolder) {
        remId = remFolder.id;
      } else {
        const created = await chromeApi.createBookmark({
          parentId: "1",
          title: "TabStack Reminders",
        });
        remId = created.id;
      }
      setRemindersFolderId(remId);

      // Move existing reminders to the organized folder
      const outOfPlace: any[] = [];
      const findOutOfPlace = (nodes: any[]) => {
        for (let n of nodes) {
          if (m[n.id]?.type === "reminder" && n.parentId !== remId) {
            outOfPlace.push(n);
          }
          if (n.children) findOutOfPlace(n.children);
        }
      };
      findOutOfPlace(tr);

      if (outOfPlace.length > 0 && !isMoving.current) {
        isMoving.current = true;
        for (const item of outOfPlace) {
          await chromeApi.moveBookmark(item.id, { parentId: remId });
        }
        isMoving.current = false;
        // The last move will trigger a refresh anyway via the listener, 
        // but we ensure the flag is cleared.
      }

      // After loading tree, ensure all boards exist in the actual bookmarks tree
      if (tr.length > 0) {
        const rootBookmarks = tr[0].children || [];

        // Auto-discover "TabStack" boards
        const discoveredBoards = rootBookmarks
          .filter(
            (node: any) =>
              !node.url &&
              node.title.startsWith("TabStack ") &&
              node.title !== "TabStack Notes" &&
              node.title !== "TabStack Reminders"
          )
          .map((node: any) => ({ id: node.id, name: node.title }));

        // Merge discovered with existing settings, avoiding duplicates
        const mergedBoards = [...settings.boards];
        discoveredBoards.forEach((d: any) => {
          if (!mergedBoards.find((b) => b.id === d.id)) {
            mergedBoards.push(d);
          }
        });

        // Validate existence in tree (cleanup deleted boards)
        const validBoards = mergedBoards.filter((b) => {
           if (b.id === notesId || b.id === remId) return false;
           // Check if it exists in root (since we only auto-discover from root)
           // OR recursively check if we want to support nested boards (stick to root for now based on 'createBoard' logic)
           const exists = rootBookmarks.find((n: any) => n.id === b.id);
           // Also check recursively if it was a deep board (though auto-discover is shallow)
           if (exists) return true;

           // Fallback recursive check for pre-existing deep boards
           const find = (nodes: any[]): any => {
            for (let n of nodes) {
              if (n.id === b.id) return n;
              if (n.children) {
                const f = find(n.children);
                if (f) return f;
              }
            }
            return null;
          };
          return find(rootBookmarks);
        });

        if (
          JSON.stringify(validBoards) !== JSON.stringify(settings.boards)
        ) {
          setSettings((s) => ({ ...s, boards: validBoards }));
        }
      }
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  };

  useEffect(() => {
    const loadInitialSettings = async () => {
      const syncedSettings = await chromeApi.getSettings(DEFAULT_SETTINGS);
      if (syncedSettings) {
        if (!syncedSettings.boards) syncedSettings.boards = DEFAULT_SETTINGS.boards;
        setSettings(syncedSettings);
      }
      setIsSettingsLoaded(true);
    };
    loadInitialSettings();

    refreshData();
    // Listen for tab/bookmark changes if in extension
    if (typeof chrome !== "undefined" && chrome.bookmarks) {
      const handler = () => refreshData();
      chrome.bookmarks.onCreated.addListener(handler);
      chrome.bookmarks.onRemoved.addListener(handler);
      chrome.bookmarks.onChanged.addListener(handler);
      chrome.bookmarks.onMoved.addListener(handler);
      
      // Listen for storage changes (sync across devices)
      const storageHandler = (changes: any, area: string) => {
        if (area === 'sync') {
          if (changes.appSettings) {
            setSettings(changes.appSettings.newValue);
          }
          if (changes.bookmarkMetadata) {
            setMetadata(changes.bookmarkMetadata.newValue);
          }
        }
      };
      chrome.storage.onChanged.addListener(storageHandler);

      if (chrome.tabs) {
        chrome.tabs.onCreated.addListener(handler);
        chrome.tabs.onRemoved.addListener(handler);
        chrome.tabs.onUpdated.addListener(handler);
      }
      return () => {
        chrome.bookmarks.onCreated.removeListener(handler);
        chrome.bookmarks.onRemoved.removeListener(handler);
        chrome.bookmarks.onChanged.removeListener(handler);
        chrome.bookmarks.onMoved.removeListener(handler);
        chrome.storage.onChanged.removeListener(storageHandler);
      };
    }
  }, []);

  useEffect(() => {
    if (isSettingsLoaded) {
      chromeApi.saveSettings(settings);
    }
    document.body.setAttribute("data-theme", settings.theme);
  }, [settings, isSettingsLoaded]);

  // Derived State
  const { flatFolders, looseBookmarks, allBookmarks } = useMemo(() => {
    const activeBoardId = settings.activeBoardId;
    let boardNode: any = null;

    const findNode = (nodes: any[], id: string): any => {
      for (const node of nodes) {
        if (String(node.id) === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (tree && tree.length > 0) {
      boardNode =
        findNode(tree[0].children || [], activeBoardId) ||
        findNode(tree[0].children || [], "1");
    }

    const flat: any[] = [];
    const loose: any[] = [];
    const all: any[] = [];

    if (boardNode && boardNode.children) {
      // Recursively collect all folders and all bookmarks
      const collect = (node: any, isRoot: boolean) => {
        if (node.children) {
          // Skip the Notes folder if encountered
          if (node.id === notesFolderId || node.id === remindersFolderId) return;

          if (!isRoot) flat.push(node);
          node.children.forEach((child: any) => {
            if (child.id === notesFolderId || child.id === remindersFolderId) return; // Skip

            if (!child.children) {
              all.push(child);
              if (isRoot) loose.push(child);
            } else {
              collect(child, false);
            }
          });
        }
      };
      collect(boardNode, true);
    }

    return { flatFolders: flat, looseBookmarks: loose, allBookmarks: all };
  }, [tree, settings.activeBoardId, notesFolderId]);

  const reminders = useMemo(() => {
    const res: any[] = [];
    Object.keys(metadata).forEach((id) => {
      if (metadata[id].type === "reminder") {
        const findInTree = (nodes: any[]): any => {
          for (let n of nodes) {
            if (n.id === id) return n;
            if (n.children) {
              const f = findInTree(n.children);
              if (f) return f;
            }
          }
          return null;
        };
        const item = findInTree(tree);
        if (item) res.push({ ...item, ...metadata[id] });
      }
    });
    return res.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : 0;
      const db = b.deadline ? new Date(b.deadline).getTime() : 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    });
  }, [metadata, tree]);

  const notes = useMemo(() => {
    if (!notesFolderId || !tree || tree.length === 0) return [];
    const findFolder = (nodes: any[]): any => {
      for (let n of nodes) {
        if (n.id === notesFolderId) return n;
        if (n.children) {
          const f = findFolder(n.children);
          if (f) return f;
        }
      }
      return null;
    };
    const folder = findFolder(tree);
    if (!folder || !folder.children) return [];

    return folder.children.map((n: any) => ({
      ...n,
      ...metadata[n.id],
      type: "note",
    }));
  }, [tree, notesFolderId, metadata]);

  // Handlers
  const handleToggleSection = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      collapsedSections: prev.collapsedSections.includes(id)
        ? prev.collapsedSections.filter((s) => s !== id)
        : [...prev.collapsedSections, id],
    }));
  };

  const deleteItem = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Item",
      message: "Are you sure you want to permanently delete this item?",
      onConfirm: async () => {
        await chromeApi.removeTree(id);
        refreshData();
      },
    });
  };

  const handleSaveEdit = async (data: EditData) => {
    const { id, title, url, type, description, deadline } = data;
    const metaToSave = { description, deadline, type };

    try {
      let savedId = id;
      if (!id) {
        const parentId =
          type === "note"
            ? notesFolderId || "1"
            : type === "reminder"
            ? remindersFolderId || "1"
            : settings.activeTab !== "tabs"
            ? settings.activeTab
            : settings.activeBoardId;
        const createParams: any = {
          parentId:
            parentId === "tabs" || parentId === "Space" ? "1" : parentId,
          title,
        };
        if (type !== "folder" && type !== "note")
          createParams.url = url || (type === "reminder" ? "about:blank" : "");
        if (type === "note") createParams.url = "about:blank"; // Notes use about:blank as placeholder

        const created = await chromeApi.createBookmark(createParams);
        savedId = created.id;
      } else {
        const updateParams: any = { title };
        if (type !== "folder" && type !== "note") updateParams.url = url;
        await chromeApi.updateBookmark(id, updateParams);
      }

      if (savedId) {
        const newMeta = { ...metadata, [savedId]: metaToSave };
        await chromeApi.saveMetadata(newMeta);
        setMetadata(newMeta);
      }
      setIsModalOpen(false);
      refreshData();
    } catch (e) {
      console.error("Failed to save metadata", e);
    }
  };

  const handleCreateBoard = async () => {
    const name = prompt("Enter Board Name:");
    if (!name) return;

    const folderTitle = name.toLowerCase().startsWith("tabstack ")
      ? name
      : `TabStack ${name}`;

    try {
      const folder = await chromeApi.createBookmark({
        parentId: "1",
        title: folderTitle,
      });

      setSettings((s) => ({
        ...s,
        boards: [...s.boards, { id: folder.id, name: folder.title }],
        activeBoardId: folder.id,
        activeSidebarItem: "bookmarks",
        activeTab: "tabs",
      }));
      refreshData();
    } catch (e) {
      console.error("Failed to create board", e);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = async (e: React.DragEvent, parentId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === parentId) return;

    try {
      // Check if it's a tab or bookmark (tabs are numeric, but in our wrapper we handle it)
      const tab = tabs.find((t) => String(t.id) === sourceId);
      if (tab) {
        // Convert Tab to Bookmark
        await chromeApi.createBookmark({
          parentId,
          title: tab.title,
          url: tab.url,
        });
      } else {
        // Move Bookmark
        await chromeApi.moveBookmark(sourceId, { parentId });
      }
      refreshData();
    } catch (err) {
      console.error("Drag and Drop failed", err);
    }
    setDraggingId(null);
  };

  const renderSection = (
    title: string,
    items: any[],
    id: string,
    isTabSection = false
  ) => {
    if (!items || items.length === 0) return null;
    const filteredItems = searchQuery
      ? items.filter((i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items;
    if (filteredItems.length === 0 && searchQuery) return null;

    const isCollapsed = settings.collapsedSections.includes(id);

    return (
      <div
        id={`section-${id}`}
        className={`mb-8 w-full group/section transition-all ${
          draggingId ? "scale-[0.99] opacity-80" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => !isTabSection && handleDrop(e, id)}
      >
        <div
          className="flex items-center gap-2 mb-4 cursor-pointer select-none"
          onClick={() => handleToggleSection(id)}
        >
          <div
            className={`p-1 rounded-md text-text-secondary hover:bg-border-card transition-all ${
              isCollapsed ? "-rotate-90" : ""
            }`}
          >
            <ChevronDown size={14} />
          </div>
          <h3 className="text-[14px] font-bold text-text-primary/90 flex items-center gap-2 uppercase tracking-tight">
            {title}
            <span className="text-text-secondary text-xs font-medium opacity-40 ml-1 bg-border-card px-1.5 rounded-full">
              {items.length}
            </span>
          </h3>
        </div>

        {!isCollapsed && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {filteredItems.map((item: any) => (
              <Card
                key={item.id || item.title}
                item={{ ...item, ...metadata[item.id] }}
                now={now}
                isTab={isTabSection}
                onClick={() => {
                  if (isTabSection) {
                    chromeApi.activateTab(item.id);
                  } else if (item.children) {
                    const section = document.getElementById(
                      `section-${item.id}`
                    );
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                      if (
                        settings.collapsedSections.includes(String(item.id))
                      ) {
                        handleToggleSection(String(item.id));
                      }
                    }
                  } else if (item.url) {
                    window.location.href = item.url;
                  }
                }}
                onEdit={() => {
                  setModalInitialData({
                    ...item,
                    ...metadata[item.id],
                    type:
                      item.children || item.type === "folder"
                        ? "folder"
                        : metadata[item.id]?.type || "bookmark",
                  });
                  setModalForceType(null);
                  setIsModalOpen(true);
                }}
                onDelete={() =>
                  isTabSection
                    ? chromeApi.closeTab(item.id)
                    : deleteItem(item.id)
                }
                onClose={() => chromeApi.closeTab(item.id)}
                onDragStart={(e) => handleDragStart(e, String(item.id))}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-bg text-text-primary font-sans overflow-hidden transition-colors duration-300 selection:bg-accent/30">
      <Sidebar
        collapsed={settings.sidebarCollapsed}
        theme={settings.theme}
        boards={settings.boards}
        activeBoardId={settings.activeBoardId}
        activeTabId={settings.activeTab}
        activeSidebarItem={settings.activeSidebarItem}
        onToggleSidebar={() =>
          setSettings((s) => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }))
        }
        onToggleTheme={() =>
          setSettings((s) => ({
            ...s,
            theme: s.theme === "light" ? "dark" : "light",
          }))
        }
        onSelectBoard={(id) =>
          setSettings((s) => ({
            ...s,
            activeBoardId: id,
            activeSidebarItem: "bookmarks",
            activeTab: "tabs",
          }))
        }
        onSelectFolder={(id) =>
          setSettings((s) => ({
            ...s,
            activeTab: id,
            activeSidebarItem: "bookmarks",
          }))
        }
        onSelectSpace={() =>
          setSettings((s) => ({ ...s, activeSidebarItem: "spaces" }))
        }
        onSelectNotes={() =>
          setSettings((s) => ({ ...s, activeSidebarItem: "notes" }))
        }
        onSelectReminders={() =>
          setSettings((s) => ({ ...s, activeSidebarItem: "reminders" }))
        }
        onCreateBoard={handleCreateBoard}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-bg relative">
        <TopBar
          onSearch={setSearchQuery}
          onViewValues={() =>
            setSettings((s) => ({
              ...s,
              viewMode: s.viewMode === "feed" ? "tabs" : "feed",
            }))
          }
          viewMode={settings.viewMode}
          onCreate={(type) => {
            setModalForceType(type);
            setModalInitialData(null);
            setIsModalOpen(true);
          }}
          onAddReminder={() => {
            setModalForceType("reminder");
            setModalInitialData(null);
            setIsModalOpen(true);
          }}
          tabCount={tabs.length}
        />

        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          {/* Reminders Shelf */}
          {settings.activeSidebarItem !== "spaces" &&
            settings.activeSidebarItem !== "reminders" &&
            reminders.length > 0 && (
            <div
              className={`mb-10 p-4 bg-gradient-to-br from-bg-card to-accent-glow/10 border border-border-card rounded-2xl backdrop-blur-md max-w-[1600px] mx-auto shadow-sm transition-all duration-300 ${
                settings.collapsedSections.includes("reminders")
                  ? "pb-4"
                  : "pb-6"
              }`}
            >
              <div
                className="text-xs font-bold uppercase tracking-widest text-accent flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2" onClick={() => handleToggleSection("reminders")}>
                  <Clock size={16} /> Active Reminders{" "}
                  <span className="text-[10px] opacity-50 bg-accent/10 px-1.5 py-0.5 rounded-full">
                    {reminders.length}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSettings(s => ({ ...s, activeSidebarItem: 'reminders' }))}
                    className="text-[10px] bg-accent/10 hover:bg-accent/20 px-2 py-1 rounded transition-colors"
                  >
                    View All
                  </button>
                  <div
                    onClick={() => handleToggleSection("reminders")}
                    className={`transition-transform duration-300 ${
                      settings.collapsedSections.includes("reminders")
                        ? "-rotate-90"
                        : ""
                    }`}
                  >
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {!settings.collapsedSections.includes("reminders") && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 mt-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[160px] overflow-hidden relative">
                  {reminders.map((r: any) => (
                      <Card
                        key={r.id}
                        item={r}
                        now={now}
                        onClick={() => {
                          if (r.url && r.url !== "about:blank") {
                            window.location.href = r.url;
                          } else {
                            setModalInitialData(r);
                            setModalForceType("reminder");
                            setIsModalOpen(true);
                          }
                        }}
                        onEdit={() => {
                          setModalInitialData(r);
                          setModalForceType("reminder");
                          setIsModalOpen(true);
                        }}
                        onDelete={() => deleteItem(r.id)}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="max-w-[1600px] mx-auto">
            {settings.activeSidebarItem === "spaces" ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    Your Spaces
                  </h2>
                  <div className="h-px flex-1 bg-border-card mx-6"></div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 px-2">
                  <div
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        activeSidebarItem: "notes",
                      }))
                    }
                    className="h-[160px] p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-gradient-to-br hover:from-bg-card hover:to-accent-glow/20 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 text-accent/5 group-hover:text-accent/10 transition-colors">
                      <FileText size={120} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div>
                      <span className="text-xl font-black text-text-primary group-hover:text-accent transition-colors tracking-tight">
                        Notes
                      </span>
                      <div className="text-xs text-text-secondary mt-1 font-medium">
                        View and manage your notes
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        activeSidebarItem: "reminders",
                      }))
                    }
                    className="h-[160px] p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-gradient-to-br hover:from-bg-card hover:to-accent-glow/20 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 text-accent/5 group-hover:text-accent/10 transition-colors">
                      <Bell size={120} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bell size={20} />
                    </div>
                    <div>
                      <span className="text-xl font-black text-text-primary group-hover:text-accent transition-colors tracking-tight">
                        Reminders
                      </span>
                      <div className="text-xs text-text-secondary mt-1 font-medium">
                        Stay on top of your tasks
                      </div>
                    </div>
                  </div>

                  {settings.boards.map((board) => (
                    <div
                      key={board.id}
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          activeBoardId: board.id,
                          activeSidebarItem: "bookmarks",
                        }))
                      }
                      className="h-[160px] p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-gradient-to-br hover:from-bg-card hover:to-accent-glow/20 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -top-4 text-accent/5 group-hover:text-accent/10 transition-colors">
                        <LayoutGrid size={120} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                        <LayoutGrid size={20} />
                      </div>
                      <div>
                        <span className="text-xl font-black text-text-primary group-hover:text-accent transition-colors tracking-tight">
                          {board.name}
                        </span>
                        <div className="text-xs text-text-secondary mt-1 font-medium">
                          Custom Board Space
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : settings.activeSidebarItem === "notes" ? (
              <div className="animate-in fade-in duration-500">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    My Notes
                  </h2>
                  <button
                    onClick={() => {
                      setModalForceType("note");
                      setModalInitialData(null);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:shadow-lg hover:shadow-accent/20 transition-all"
                  >
                    <Plus size={16} /> New Note
                  </button>
                </div>
                {notes.length > 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                    {notes.map((note: any) => (
                      <Card
                        key={note.id}
                        item={note}
                        now={now}
                        onClick={() => {
                          setModalInitialData(note);
                          setModalForceType("note");
                          setIsModalOpen(true);
                        }}
                        onEdit={() => {
                          setModalInitialData(note);
                          setModalForceType("note");
                          setIsModalOpen(true);
                        }}
                        onDelete={() => deleteItem(note.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-border-card rounded-3xl opacity-30">
                    You haven't created any notes yet.
                  </div>
                )}
              </div>
            ) : settings.activeSidebarItem === "reminders" ? (
              <div className="animate-in fade-in duration-500">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    All Reminders
                  </h2>
                  <button
                    onClick={() => {
                      setModalForceType("reminder");
                      setModalInitialData(null);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:shadow-lg hover:shadow-accent/20 transition-all"
                  >
                    <Plus size={16} /> New Reminder
                  </button>
                </div>
                {reminders.length > 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                    {reminders.map((reminder: any) => (
                      <Card
                        key={reminder.id}
                        item={reminder}
                        now={now}
                        onClick={() => {
                          setModalInitialData(reminder);
                          setModalForceType("reminder");
                          setIsModalOpen(true);
                        }}
                        onEdit={() => {
                          setModalInitialData(reminder);
                          setModalForceType("reminder");
                          setIsModalOpen(true);
                        }}
                        onDelete={() => deleteItem(reminder.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-border-card rounded-3xl opacity-30">
                    No reminders active at the moment.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-10 items-start">
                <div className="flex flex-col min-w-0">
                  {settings.viewMode === "tabs" ? (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex flex-wrap gap-2 px-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                        {[
                          { id: "tabs", title: "Running Tabs", count: tabs.length },
                          ...flatFolders.map((f: any) => ({
                            id: f.id,
                            title: f.title,
                            count: f.children?.length || 0,
                          })),
                        ].map((chip) => (
                          <button
                            key={chip.id}
                            onClick={() =>
                              setSettings((s) => ({ ...s, activeTab: chip.id }))
                            }
                            className={`px-3 py-1.5 rounded-lg border text-[12px] font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                              settings.activeTab === chip.id
                                ? "bg-accent text-white border-accent shadow-md shadow-accent/10"
                                : "bg-bg-card border-border-card text-text-secondary hover:text-text-primary hover:bg-border-card"
                            }`}
                          >
                            {chip.title}
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                settings.activeTab === chip.id
                                  ? "bg-white/20 text-white"
                                  : "bg-bg text-text-secondary"
                              }`}
                            >
                              {chip.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) =>
                          settings.activeTab !== "tabs" &&
                          handleDrop(e, settings.activeTab)
                        }
                      >
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                          {(settings.activeTab === "tabs"
                            ? tabs
                            : flatFolders.find(
                                (f: any) =>
                                  String(f.id) === String(settings.activeTab)
                              )?.children || []
                          ).map((item: any) => (
                            <Card
                              key={item.id}
                              item={{ ...item, ...metadata[item.id] }}
                              now={now}
                              isTab={settings.activeTab === "tabs"}
                              onClick={() => {
                                if (settings.activeTab === "tabs") {
                                  chromeApi.activateTab(item.id);
                                } else if (item.children) {
                                  setSettings((s) => ({
                                    ...s,
                                    activeTab: String(item.id),
                                  }));
                                } else if (item.url) {
                                  window.location.href = item.url;
                                }
                              }}
                              onEdit={() => {
                                setModalInitialData({
                                  ...item,
                                  ...metadata[item.id],
                                  type:
                                    item.children || item.type === "folder"
                                      ? "folder"
                                      : metadata[item.id]?.type || "bookmark",
                                });
                                setModalForceType(null);
                                setIsModalOpen(true);
                              }}
                              onDelete={() =>
                                settings.activeTab === "tabs"
                                  ? chromeApi.closeTab(item.id)
                                  : deleteItem(item.id)
                              }
                              onClose={() => chromeApi.closeTab(item.id)}
                              onDragStart={(e) =>
                                handleDragStart(e, String(item.id))
                              }
                            />
                          ))}
                          {(settings.activeTab === "tabs"
                            ? tabs
                            : flatFolders.find(
                                (f: any) =>
                                  String(f.id) === String(settings.activeTab)
                              )?.children || []
                          ).length === 0 && (
                            <div className="col-span-full py-20 text-center text-text-secondary border-2 border-dashed border-border-card rounded-3xl opacity-40">
                              No items found in this section
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-300">
                      {renderSection("Running Tabs", tabs, "tabs", true)}
                      {flatFolders.map((folder: any) =>
                        renderSection(folder.title, folder.children, folder.id)
                      )}
                      {flatFolders.length === 0 &&
                        looseBookmarks.length === 0 &&
                        tabs.length === 0 && (
                          <div className="py-20 text-center border-2 border-dashed border-border-card rounded-3xl opacity-30">
                            This space is looking a bit empty. Create some
                            bookmarks or folders!
                          </div>
                        )}
                    </div>
                  )}
                </div>

                <aside className="flex flex-col gap-8 sticky top-4 h-fit max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pb-10">
                  {topSites.length > 0 && (
                    <div className="w-full">
                      <div
                        className="flex items-center gap-2 mb-4 cursor-pointer select-none group/title"
                        onClick={() => handleToggleSection("topsites")}
                      >
                        <div
                          className={`p-1 rounded-md text-text-secondary group-hover/title:bg-border-card transition-all ${
                            settings.collapsedSections.includes("topsites")
                              ? "-rotate-90"
                              : ""
                          }`}
                        >
                          <ChevronDown size={14} />
                        </div>
                        <h3 className="text-[14px] font-bold text-text-primary/90 flex items-center gap-2 uppercase tracking-wide">
                          Most Visited
                          <span className="text-text-secondary text-[10px] font-bold opacity-30 ml-1 bg-border-card px-1.5 py-0.5 rounded-full">
                            {topSites.length}
                          </span>
                        </h3>
                      </div>

                      {!settings.collapsedSections.includes("topsites") && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          {topSites.map((site: any, idx: number) => (
                            <div
                              key={idx}
                              onClick={() =>
                                site.url && (window.location.href = site.url)
                              }
                              className="p-3 rounded-xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-center cursor-pointer group"
                            >
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${
                                  site.url || ""
                                }&sz=64`}
                                className="w-8 h-8 mx-auto mb-2 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                                alt=""
                              />
                              <div className="text-[11px] font-bold text-text-primary truncate">
                                {site.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {renderSection("Quick Links", looseBookmarks, "loose")}
                </aside>
              </div>
            )}
          </div>
        </div>
      </main>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={modalInitialData}
        forceType={modalForceType}
      />

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;
