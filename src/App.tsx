import React, { useEffect, useState, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Card } from "./components/Card";
import { EditModal, EditData } from "./components/EditModal";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { chromeApi } from "./utils/chrome";
import { DashboardView } from "./pages/DashboardView";
import { SpacesView } from "./pages/SpacesView";
import { NotesView } from "./pages/NotesView";
import { RemindersView } from "./pages/RemindersView";
import { BookmarksView } from "./pages/BookmarksView";
import { WatchlistView } from "./pages/WatchlistView";
import { CustomizeSettings } from "./pages/CustomizeSettings";
import { SectionList } from "./components/SectionList";
import { Settings, DEFAULT_SETTINGS, BookmarkItem } from "./types";
import { Clock as ClockWidget, Calendar } from "./components/Widgets";

import { ChevronDown, ExternalLink, Folder } from "lucide-react";

// --- Sync Helpers ---
/**
 * encodeMetaToUrl
 * Embeds custom metadata (description, deadline, type) into the bookmark URL's hash.
 * This ensures that metadata is synced across devices because Chrome syncs bookmark URLs.
 * @param url The base URL
 * @param meta The metadata object to encode
 */
const encodeMetaToUrl = (url: string, meta: any) => {
  try {
    const cleanUrl = url || "about:blank";
    const [base, hash] = cleanUrl.split("#");
    const hashParams = new URLSearchParams(hash || "");
    const metaStr = JSON.stringify(meta);
    const encoded = btoa(encodeURIComponent(metaStr)); // Base64 encode for URL safety
    hashParams.set("tsmeta", encoded);
    return `${base}#${hashParams.toString()}`;
  } catch (e) {
    return url;
  }
};

/**
 * decodeMetaFromUrl
 * Extracts metadata from a bookmark URL that was previously encoded.
 * @param url The bookmark URL
 */
const decodeMetaFromUrl = (url: string) => {
  try {
    if (!url || !url.includes("#")) return {};
    const hash = url.split("#")[1];
    if (!hash) return {};
    const params = new URLSearchParams(hash);
    const encoded = params.get("tsmeta");
    if (!encoded) return {};
    const decoded = decodeURIComponent(atob(encoded));
    return JSON.parse(decoded);
  } catch (e) {
    return {};
  }
};
/**
 * getCleanUrlFromUrl
 * Removes TabStack internal metadata from the URL for display in edit fields.
 * @param url The bookmark URL
 */
const getCleanUrlFromUrl = (url: string | undefined): string => {
  try {
    if (!url) return "";
    if (!url.includes("#")) return url;
    const [base, hash] = url.split("#");
    const params = new URLSearchParams(hash);
    params.delete("tsmeta");
    const newHash = params.toString();
    return newHash ? `${base}#${newHash}` : base;
  } catch (e) {
    return url || "";
  }
};
/**
 * enrichItem
 * Combines a base bookmark node with metadata from URL hashes and sync storage.
 * URL hashes are treated as the primary source of truth for better cross-device sync.
 */
const enrichItem = (node: any, metadata: Record<string, any> = {}): any => {
  if (!node) return null;
  const urlMeta = decodeMetaFromUrl(node.url);
  const syncMeta = metadata[node.id] || {};
  return {
    ...node,
    ...syncMeta,
    ...urlMeta, // URL hash takes priority for sync
  };
};

// --------------------

const App = () => {
  // ... logic ...
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const isProcessingSync = React.useRef(false);

  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [tree, setTree] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [topSites, setTopSites] = useState<chrome.topSites.MostVisitedURL[]>(
    []
  );
  const [history, setHistory] = useState<chrome.history.HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(Date.now());
  const [tabStackFolderId, setTabStackFolderId] = useState<string | null>(null);
  const [notesFolderId, setNotesFolderId] = useState<string | null>(null);
  const [remindersFolderId, setRemindersFolderId] = useState<string | null>(
    null
  );
  const [quickLinksFolderId, setQuickLinksFolderId] = useState<string | null>(
    null
  );
  const [watchlistFolderId, setWatchlistFolderId] = useState<string | null>(
    null
  );

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
    "bookmark" | "folder" | "reminder" | "note" | "watchlist" | null
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

  // --- Data Loading & Lifecycle ---
  /**
   * refreshData
   * The core engine for fetching state from Chrome. 
   * It handles tree discovery, folder migrations, and metadata merging.
   */
  const refreshData = async () => {
    if (isMoving.current) return; // Prevent concurrent modifications
    try {
      const [t, tr, m, ts, h] = await Promise.all([
        chromeApi.getTabs(),
        chromeApi.getTree(),
        chromeApi.getMetadata(),
        chromeApi.getTopSites(),
        chromeApi.getHistory(50),
      ]);
      setTabs(t || []);
      setTree(tr || []);
      setMetadata(m || {});
      setTopSites((ts || []).slice(0, 10));
      setHistory(h || []);

      const findFolder = (
        nodes: any[],
        title: string,
        parentId?: string
      ): any => {
        let bestMatch = null;
        for (let n of nodes) {
          if (
            n.title === title &&
            !n.url &&
            (!parentId || n.parentId === String(parentId))
          ) {
            // Favor folders that have children
            if (n.children && n.children.length > 0) return n;
            if (!bestMatch) bestMatch = n;
          }
          if (n.children) {
            const f = findFolder(n.children, title, parentId);
            if (f) {
               if (f.children && f.children.length > 0) return f;
               if (!bestMatch) bestMatch = f;
            }
          }
        }
        return bestMatch;
      };

      const rootNodes = tr[0]?.children || [];

      // 1. Find or Create TabStack Parent Folder
      let tsParent = findFolder(tr, "TabStack", "1");
      if (!tsParent) {
        // Fallback: search globally for folder named Exactly "TabStack"
        tsParent = findFolder(tr, "TabStack");
      }

      if (!tsParent) {
        isMoving.current = true;
        tsParent = await chromeApi.createBookmark({
          parentId: "1",
          title: "TabStack",
        });
        isMoving.current = false;
        // Re-fetch tree after creation to get children structure
        const updatedTree = await chromeApi.getTree();
        setTree(updatedTree);
        tr[0] = updatedTree[0];
      }
      setTabStackFolderId(tsParent.id);

      // 2. Find or Create Notes inside Parent
      let notesFolderNode = findFolder(
        tsParent.children || [],
        "Notes",
        tsParent.id
      );
      if (!notesFolderNode) {
        const legacyNotes = findFolder(tr, "TabStack Notes");
        if (legacyNotes) {
          isMoving.current = true;
          await chromeApi.moveBookmark(legacyNotes.id, {
            parentId: tsParent.id,
          });
          await chromeApi.updateBookmark(legacyNotes.id, { title: "Notes" });
          isMoving.current = false;
          notesFolderNode = {
            ...legacyNotes,
            parentId: tsParent.id,
            title: "Notes",
          };
        } else {
          isMoving.current = true;
          notesFolderNode = await chromeApi.createBookmark({
            parentId: tsParent.id,
            title: "Notes",
          });
          isMoving.current = false;
        }
      }
      setNotesFolderId(notesFolderNode.id);

      // 3. Find or Create Reminders inside Parent
      let remFolderNode = findFolder(
        tsParent.children || [],
        "Reminders",
        tsParent.id
      );
      if (!remFolderNode) {
        const legacyRem = findFolder(tr, "TabStack Reminders");
        if (legacyRem) {
          isMoving.current = true;
          await chromeApi.moveBookmark(legacyRem.id, { parentId: tsParent.id });
          await chromeApi.updateBookmark(legacyRem.id, { title: "Reminders" });
          isMoving.current = false;
          remFolderNode = {
            ...legacyRem,
            parentId: tsParent.id,
            title: "Reminders",
          };
        } else {
          isMoving.current = true;
          remFolderNode = await chromeApi.createBookmark({
            parentId: tsParent.id,
            title: "Reminders",
          });
          isMoving.current = false;
        }
      }
      setRemindersFolderId(remFolderNode.id);

      // 4. Find or Create QuickLinks
      let qlFolderNode = findFolder(tr, "QuickLinks", "1");
      if (!qlFolderNode) {
        // Fallback: search globally if not found in Bookmarks Bar
        qlFolderNode = findFolder(tr, "QuickLinks");
      }

      if (!qlFolderNode) {
        isMoving.current = true;
        qlFolderNode = await chromeApi.createBookmark({
          parentId: "1",
          title: "QuickLinks",
        });
        isMoving.current = false;
        // Refresh tree again to ensure we have the newly created node with its children
        const updatedTree = await chromeApi.getTree();
        setTree(updatedTree);
      }
      setQuickLinksFolderId(qlFolderNode.id);

      // 5. Find or Create Watchlist inside Parent
      let wlFolderNode = findFolder(
        tsParent.children || [],
        "Watchlist",
        tsParent.id
      );
      if (!wlFolderNode) {
        isMoving.current = true;
        wlFolderNode = await chromeApi.createBookmark({
          parentId: tsParent.id,
          title: "Watchlist",
        });
        isMoving.current = false;
        // Refresh tree again to ensure we have the newly created node with its children
        const updatedTree = await chromeApi.getTree();
        setTree(updatedTree);
        tr[0] = updatedTree[0];
        tsParent = findFolder(updatedTree, "TabStack");
        wlFolderNode = findFolder(tsParent.children || [], "Watchlist", tsParent.id);
      }
      setWatchlistFolderId(wlFolderNode.id);

      // 6. Migrate legacy boards from Root to Parent
      const legacyBoards = rootNodes.filter(
        (n) =>
          !n.url &&
          n.title.startsWith("TabStack ") &&
          n.title !== "TabStack" &&
          n.title !== "TabStack Notes" &&
          n.title !== "TabStack Reminders"
      );
      if (legacyBoards.length > 0 && !isMoving.current) {
        isMoving.current = true;
        for (const b of legacyBoards) {
          const newTitle = b.title.replace(/^TabStack\s+/, "");
          await chromeApi.moveBookmark(b.id, { parentId: tsParent.id });
          await chromeApi.updateBookmark(b.id, { title: newTitle });
        }
        isMoving.current = false;
      }

      // 7. Move out-of-place items (Reminders, Notes, Watchlist)
      if (!isMoving.current) {
        const outOfPlace: { id: string; targetId: string }[] = [];
        const findMisplaced = (nodes: any[]) => {
          for (let n of nodes) {
            const enriched = enrichItem(n, m);
            if (enriched.type === "reminder" && n.parentId !== remFolderNode.id) {
              outOfPlace.push({ id: n.id, targetId: remFolderNode.id });
            } else if (
              enriched.type === "note" &&
              n.parentId !== notesFolderNode.id
            ) {
              outOfPlace.push({ id: n.id, targetId: notesFolderNode.id });
            } else if (
              enriched.type === "watchlist" &&
              wlFolderNode &&
              n.parentId !== wlFolderNode.id
            ) {
              outOfPlace.push({ id: n.id, targetId: wlFolderNode.id });
            }
            if (n.children) findMisplaced(n.children);
          }
        };
        findMisplaced(tr);

        if (outOfPlace.length > 0) {
          isMoving.current = true;
          for (const item of outOfPlace) {
            await chromeApi.moveBookmark(item.id, { parentId: item.targetId });
          }
          isMoving.current = false;
        }
      }

      // 8. Discover boards inside TabStack parent
      if (tr.length > 0) {
        const tsChildren = tsParent.children || [];
        const discoveredBoards = tsChildren
          .filter(
            (node: any) =>
              !node.url &&
              node.id !== notesFolderNode.id &&
              node.id !== remFolderNode.id &&
              node.id !== wlFolderNode.id
          )
          .map((node: any) => ({ id: node.id, name: node.title }));

        const mergedBoards = [...settings.boards];
        discoveredBoards.forEach((d: any) => {
          const existing = mergedBoards.find(
            (b) => b.id === d.id || b.name === d.name
          );
          if (!existing) {
            mergedBoards.push(d);
          } else if (existing.id !== d.id) {
            // Update to local ID if name matches but ID differs (Sync Fix)
            existing.id = d.id;
          }
        });

        // Validate existence
        const validBoards = mergedBoards.filter((b) => {
          if (b.id === notesFolderNode.id || b.id === remFolderNode.id || b.id === wlFolderNode.id)
            return false;
          
          const findInTree = (nodes: any[]): any => {
            for (let n of nodes) {
              if (n.id === b.id || (n.title === b.name && !n.url)) return n;
              if (n.children) {
                const f = findInTree(n.children);
                if (f) return f;
              }
            }
            return null;
          };
          const node = findInTree(tr);
          if (node && node.id !== b.id) {
            b.id = node.id; // Corrected ID in place
          }
          return !!node;
        });

        if (JSON.stringify(validBoards) !== JSON.stringify(settings.boards)) {
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
        if (!syncedSettings.boards)
          syncedSettings.boards = DEFAULT_SETTINGS.boards;
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
      const storageHandler = async (changes: any, area: string) => {
        if (area === "sync") {
          if (changes.appSettings) {
            isProcessingSync.current = true;
            const resolved = await chromeApi.resolveLocalSettings(changes.appSettings.newValue);
            setSettings(resolved);
            setTimeout(() => { isProcessingSync.current = false; }, 200);
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
    if (isSettingsLoaded && !isProcessingSync.current) {
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
        (tabStackFolderId
          ? findNode(tree[0].children || [], tabStackFolderId)
          : findNode(tree[0].children || [], "1"));
    }

    const flat: any[] = [];
    const loose: any[] = [];
    const all: any[] = [];

    if (boardNode && boardNode.children) {
      // Recursively collect all folders and all bookmarks
      const collect = (node: any, isRoot: boolean) => {
        if (node.children) {
          // Skip internal folders
          if (
            node.id === notesFolderId ||
            node.id === remindersFolderId ||
            node.id === tabStackFolderId
          )
            return;

          if (!isRoot) flat.push(node);
          node.children.forEach((child: any) => {
            if (
              child.id === notesFolderId ||
              child.id === remindersFolderId ||
              child.id === tabStackFolderId
            )
              return; // Skip

            const enriched = enrichItem(child, metadata);

            if (!child.children) {
              all.push(enriched);
              if (isRoot) loose.push(enriched);
            } else {
              collect(child, false);
            }
          });
        }
      };
      collect(boardNode, true);
    }

    return { flatFolders: flat, looseBookmarks: loose, allBookmarks: all };
  }, [
    tree,
    settings.activeBoardId,
    notesFolderId,
    remindersFolderId,
    tabStackFolderId,
  ]);

  const reminders = useMemo(() => {
    if (!remindersFolderId || !tree || tree.length === 0) return [];

    const findFolderNode = (nodes: any[]): any => {
      for (let n of nodes) {
        if (n.id === remindersFolderId) return n;
        if (n.children) {
          const f = findFolderNode(n.children);
          if (f) return f;
        }
      }
      return null;
    };

    const folder = findFolderNode(tree);
    if (!folder || !folder.children) return [];

    return folder.children
      .map((n: any) => {
        const enriched = enrichItem(n, metadata);
        if (!enriched.type) enriched.type = "reminder";
        return enriched;
      })
      .filter((n: any) => n.type === "reminder")
      .sort((a: any, b: any) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : 0;
        const db = b.deadline ? new Date(b.deadline).getTime() : 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      });
  }, [metadata, tree, remindersFolderId]);

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

    return folder.children
      .map((n: any) => {
        const enriched = enrichItem(n, metadata);
        if (!enriched.type) enriched.type = "note";
        return enriched;
      })
      .filter((n: any) => n.type === "note");
  }, [tree, notesFolderId, metadata]);

  const quickLinksData = useMemo(() => {
    if (!quickLinksFolderId || !tree || tree.length === 0) return [];
    const findFolder = (nodes: any[]): any => {
      for (let n of nodes) {
        if (n.id === quickLinksFolderId) return n;
        if (n.children) {
          const f = findFolder(n.children);
          if (f) return f;
        }
      }
      return null;
    };
    const folder = findFolder(tree);
    if (!folder || !folder.children) return [];

    return folder.children.map((n: any) => enrichItem(n, metadata));
  }, [tree, quickLinksFolderId, metadata]);

  const watchlistData = useMemo(() => {
    if (!watchlistFolderId || !tree || tree.length === 0) return [];
    const findFolder = (nodes: any[]): any => {
      for (let n of nodes) {
        if (n.id === watchlistFolderId) return n;
        if (n.children) {
          const f = findFolder(n.children);
          if (f) return f;
        }
      }
      return null;
    };
    const folder = findFolder(tree);
    if (!folder || !folder.children) return [];

    return folder.children.map((n: any) => enrichItem(n, metadata));
  }, [tree, watchlistFolderId, metadata]);

  // Handlers
  const handleToggleSection = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      collapsedSections: prev.collapsedSections.includes(id)
        ? prev.collapsedSections.filter((s) => s !== id)
        : [...prev.collapsedSections, id],
    }));
  };

  const handleToggleClockMode = () => {
    setSettings((s) => ({
      ...s,
      clockMode: s.clockMode === "digital" ? "analog" : "digital",
    }));
  };

  const deleteItem = (id: string, isBoard = false) => {
    if (
      id === tabStackFolderId ||
      id === notesFolderId ||
      id === remindersFolderId
    ) {
      alert("This is a core system folder and cannot be deleted.");
      return;
    }

    setConfirmState({
      isOpen: true,
      title: isBoard ? "Delete Board" : "Delete Item",
      message: isBoard
        ? "Are you sure you want to delete this board and all its contents?"
        : "Are you sure you want to permanently delete this item?",
      onConfirm: async () => {
        await chromeApi.removeTree(id);
        if (isBoard && settings.activeBoardId === id) {
          setSettings((s) => ({
            ...s,
            activeBoardId: tabStackFolderId || "1",
          }));
        }
        refreshData();
      },
    });
  };

  const handleExportData = async () => {
    try {
      const data = {
        version: "1.0",
        settings,
        metadata,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tabstack-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Export failed. Check console for details.");
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.settings) {
            setSettings((s) => ({ ...s, ...imported.settings }));
          }
          if (imported.metadata) {
            const merged = { ...metadata, ...imported.metadata };
            await chromeApi.saveMetadata(merged);
            setMetadata(merged);
          }
          alert("Data imported successfully! Settings and metadata restored.");
          refreshData();
        } catch (err) {
          console.error("Import failed", err);
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleForceSync = async () => {
    setConfirmState({
      isOpen: true,
      title: "Force Metadata Repair",
      message:
        "This will scan all your TabStack bookmarks and re-encode their special descriptions/notes directly into their URLs. This is the most reliable way to force Chrome to sync your data to other computers. Proceed?",
      onConfirm: async () => {
        try {
          let count = 0;
          const process = async (nodes: any[]) => {
            for (const n of nodes) {
              if (n.url) {
                const meta = metadata[n.id] || decodeMetaFromUrl(n.url);
                if (Object.keys(meta).length > 0) {
                  const newUrl = encodeMetaToUrl(n.url, meta);
                  if (newUrl !== n.url) {
                    await chromeApi.updateBookmark(n.id, { url: newUrl });
                    count++;
                  }
                }
              }
              if (n.children) await process(n.children);
            }
          };
          await process(tree);
          alert(`Success! Re-encoded ${count} items for sync.`);
          refreshData();
        } catch (e) {
          console.error("Force sync failed", e);
        }
      },
    });
  };

  const handleSaveEdit = async (data: EditData) => {
    const { id, title, url, type, description, deadline } = data;
    const effectiveType = (type === "bookmark" && settings.activeSidebarItem === "watchlist") ? "watchlist" : type;
    const metaToSave = { description, deadline, type: effectiveType };

    try {
      let savedId = id;
      if (!id) {
        const parentId =
          type === "note"
            ? notesFolderId || "1"
            : type === "reminder"
            ? remindersFolderId || "1"
            : type === "quicklink"
            ? quickLinksFolderId || "1"
            : type === "watchlist" || settings.activeSidebarItem === "watchlist"
            ? watchlistFolderId || "1"
            : settings.activeTab !== "tabs"
            ? settings.activeTab
            : settings.activeBoardId;
        const createParams: any = {
          parentId:
            parentId === "tabs" || parentId === "Space" ? "1" : parentId,
          title,
        };

        const baseUrl =
          url || (type === "reminder" || type === "note" ? "about:blank" : "");
        if (type !== "folder") {
          createParams.url = encodeMetaToUrl(baseUrl, metaToSave);
        }

        const created = await chromeApi.createBookmark(createParams);
        savedId = created.id;
      } else {
        const updateParams: any = { title };
        if (type !== "folder") {
          updateParams.url = encodeMetaToUrl(url || "", metaToSave);
        }
        await chromeApi.updateBookmark(id, updateParams);

        // Check for relocation if type changed or it's misplaced
        const findNodeInTree = (nodes: any[]): any => {
          for (let n of nodes) {
            if (n.id === id) return n;
            if (n.children) {
              const f = findNodeInTree(n.children);
              if (f) return f;
            }
          }
          return null;
        };
        const node = findNodeInTree(tree);
        if (node) {
          if (type === "note" && node.parentId !== notesFolderId) {
            await chromeApi.moveBookmark(id, { parentId: notesFolderId! });
          } else if (type === "reminder" && node.parentId !== remindersFolderId) {
            await chromeApi.moveBookmark(id, { parentId: remindersFolderId! });
          } else if (type === "watchlist" && node.parentId !== watchlistFolderId) {
            await chromeApi.moveBookmark(id, { parentId: watchlistFolderId! });
          }
        }
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

    try {
      const folder = await chromeApi.createBookmark({
        parentId: tabStackFolderId || "1",
        title: name,
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

      if (parentId === "tabs") {
        // Dropping Item onto Running Tabs Column
        if (!tab) {
          // It's a bookmark -> Open as new tab
          const bookmark = allBookmarks.find((b) => String(b.id) === sourceId);
          if (bookmark && bookmark.url) {
            window.open(bookmark.url, "_blank");
          }
        }
        // If it's already a tab, we ignore (reordering tabs not implemented yet)
      } else {
        // Dropping Item onto a Folder Column
        if (tab) {
          // Convert Tab to Bookmark
          await chromeApi.createBookmark({
            parentId,
            title: tab.title,
            url: tab.url,
          });
        } else {
          // Move Bookmark to new Folder
          await chromeApi.moveBookmark(sourceId, { parentId });
        }
      }
      refreshData();
    } catch (err) {
      console.error("Drag and Drop failed", err);
    }
    setDraggingId(null);
  };

  /*
   * Handle Click on Card Items
   * - Tabs: Activate tab
   * - Folders: Scroll to section and expand if collapsed
   * - Bookmarks: Navigate to URL
   */
  const handleCardClick = (item: any, isTab = false) => {
    if (isTab) {
      chromeApi.activateTab(item.id);
    } else if (item.children) {
      const section = document.getElementById(`section-${item.id}`);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        // If collapsed, expand it
        if (settings.collapsedSections.includes(String(item.id))) {
          handleToggleSection(String(item.id));
        }
      }
    } else if (item.url) {
      // Direct navigation
      window.location.href = item.url;
    }
  };

  return (
    <div 
      className="relative flex h-screen bg-bg text-text-primary font-sans overflow-hidden transition-colors duration-300 selection:bg-accent/30"
      data-theme={settings.theme}
      style={
        {
          "--glass-opacity": (settings.cardOpacity ?? 60) / 100,
          "--card-blur": `${settings.cardBlur ?? 16}px`,
          "--card-bg-color": settings.cardBackgroundColor || (settings.theme === 'dark' ? '#1e293b' : '#ffffff'),
          "--card-bg": `color-mix(in srgb, var(--card-bg-color) calc(var(--glass-opacity) * 100%), transparent)`,
          "--text-primary": settings.textColor || (settings.theme === 'dark' ? '#e2e8f0' : '#0f172a'),
          "--bg-color": settings.backgroundColor || (settings.theme === 'dark' ? '#1a1c23' : '#f8fafc'),
          "--app-brightness": (settings.textBrightness ?? 100) / 100,
          filter: "brightness(var(--app-brightness))",
        } as React.CSSProperties
      }
    >
      {settings.backgroundImage && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 overflow-hidden">
          <img
            src={settings.backgroundImage}
            className="w-full h-full object-cover"
            style={{
              opacity: (settings.backgroundOpacity || 50) / 100,
              filter: `blur(${settings.backgroundBlur || 0}px)`,
            }}
            alt=""
          />
        </div>
      )}

      <div className="relative z-10 flex h-full w-full">
        <Sidebar
          collapsed={settings.sidebarCollapsed}
          theme={settings.theme}
          boards={settings.boards}
          activeBoardId={settings.activeBoardId}
          activeTabId={settings.activeTab}
          activeSidebarItem={settings.activeSidebarItem}
          hasBackground={!!settings.backgroundImage}
          onToggleSidebar={() =>
            setSettings((s) => ({
              ...s,
              sidebarCollapsed: !s.sidebarCollapsed,
            }))
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
          onSelectDashboard={() =>
            setSettings((s) => ({ ...s, activeSidebarItem: "dashboard" }))
          }
          onSelectWatchlist={() =>
            setSettings((s) => ({ ...s, activeSidebarItem: "watchlist" }))
          }
          onSelectCustomize={() =>
            setSettings((s) => ({ ...s, activeSidebarItem: "customize" }))
          }
          onCreateBoard={handleCreateBoard}
          onEditBoard={async (id, name) => {
            await chromeApi.updateBookmark(id, { title: name });
            refreshData();
          }}
          onDeleteBoard={(id) => deleteItem(id, true)}
          onSearch={setSearchQuery}
          tabStackFolderId={tabStackFolderId || undefined}
        />
        <main
          className={`flex-1 flex flex-col min-w-0 relative ${
            settings.backgroundImage ? "bg-transparent" : "bg-bg"
          }`}

        >
          <TopBar
            onSearch={setSearchQuery}
            hasBackground={!!settings.backgroundImage}
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
            <div className="max-w-[1700px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-10 items-start">
                <div className="flex flex-col min-w-0">
                  <div className="w-full">
                    {settings.activeSidebarItem === "dashboard" ? (
                      <DashboardView
                        settings={settings}
                        onToggleClockMode={handleToggleClockMode}
                        reminders={reminders}
                        quickLinks={quickLinksData}
                        now={now}
                        topSites={topSites}
                        history={history}
                        onCreateReminder={() => {
                          setModalForceType("reminder");
                          setModalInitialData(null);
                          setIsModalOpen(true);
                        }}
                        onEditReminder={(r) => {
                          setModalInitialData({
                            ...r,
                            url: getCleanUrlFromUrl(r.url),
                            type: "reminder",
                          });
                          setModalForceType("reminder");
                          setIsModalOpen(true);
                        }}
                        onDeleteReminder={(id) => deleteItem(id)}
                        onAddQuickLink={() => {
                          setModalForceType("bookmark");
                          setModalInitialData({
                            id: "",
                            title: "",
                            url: "",
                            type: "quicklink" as any,
                          });
                          setIsModalOpen(true);
                        }}
                        onEditQuickLink={(link) => {
                          setModalInitialData({
                            ...link,
                            url: getCleanUrlFromUrl(link.url),
                            type: "quicklink" as any,
                          });
                          setModalForceType("bookmark");
                          setIsModalOpen(true);
                        }}
                        onDeleteQuickLink={(id) => deleteItem(id)}
                      />
                    ) : settings.activeSidebarItem === "spaces" ? (
                      <SpacesView
                        settings={settings}
                        setSettings={setSettings}
                      />
                    ) : settings.activeSidebarItem === "notes" ? (
                      <NotesView
                        notes={notes}
                        searchQuery={searchQuery}
                        now={now}
                        onCreate={() => {
                          setModalForceType("note");
                          setModalInitialData(null);
                          setIsModalOpen(true);
                        }}
                        onEdit={(n) => {
                          setModalInitialData({ 
                            ...n, 
                            url: getCleanUrlFromUrl(n.url),
                            type: "note" 
                          });
                          setModalForceType("note");
                          setIsModalOpen(true);
                        }}
                        onDelete={(id) => deleteItem(id)}
                      />
                    ) : settings.activeSidebarItem === "reminders" ? (
                      <RemindersView
                        reminders={reminders}
                        searchQuery={searchQuery}
                        now={now}
                        onCreate={() => {
                          setModalForceType("reminder");
                          setModalInitialData(null);
                          setIsModalOpen(true);
                        }}
                        onEdit={(r) => {
                          setModalInitialData({ 
                            ...r, 
                            url: getCleanUrlFromUrl(r.url),
                            type: "reminder" 
                          });
                          setModalForceType("reminder");
                          setIsModalOpen(true);
                        }}
                        onDelete={(id) => deleteItem(id)}
                      />
                    ) : settings.activeSidebarItem === "watchlist" ? (
                      <WatchlistView
                        watchlist={watchlistData}
                        searchQuery={searchQuery}
                        now={now}
                        onCreate={() => {
                          setModalForceType("bookmark");
                          setModalInitialData({
                            id: "",
                            title: "",
                            url: "",
                            type: "watchlist" as any,
                          });
                          setIsModalOpen(true);
                        }}
                        onEdit={(item) => {
                          setModalInitialData({
                            ...item,
                            url: getCleanUrlFromUrl(item.url),
                            type: "watchlist" as any,
                          });
                          setModalForceType("bookmark");
                          setIsModalOpen(true);
                        }}
                        onDelete={(id) => deleteItem(id)}
                      />
                    ) : settings.activeSidebarItem === "customize" ? (
                      <CustomizeSettings
                        settings={settings}
                        setSettings={setSettings}
                        onExportData={handleExportData}
                        onImportData={handleImportData}
                        onForceSync={handleForceSync}
                      />
                    ) : settings.activeSidebarItem === "bookmarks" ? (
                      <BookmarksView
                        settings={settings}
                        tabs={tabs}
                        flatFolders={flatFolders}
                        looseBookmarks={looseBookmarks}
                        searchQuery={searchQuery}
                        now={now}
                        draggingId={draggingId}
                        onToggleSection={handleToggleSection}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        onItemClick={handleCardClick}
                        onItemEdit={(item: any) => {
                          setModalForceType(null);
                          setModalInitialData({
                            ...item,
                            url: getCleanUrlFromUrl(item.url)
                          });
                          setIsModalOpen(true);
                        }}
                        onItemDelete={(item: any) => deleteItem(item.id)}
                        onTabClose={(item) => chromeApi.closeTab(item.id)}
                        onCreateBookmark={() => {
                          setModalForceType("bookmark");
                          setModalInitialData(null);
                          setIsModalOpen(true);
                        }}
                        onToggleViewMode={() =>
                          setSettings((s) => ({
                            ...s,
                            gridMode:
                              s.gridMode === "horizontal"
                                ? "vertical"
                                : "horizontal",
                          }))
                        }
                        onToggleAllSections={(collapse) => {
                          if (collapse) {
                            const allIds = flatFolders.map((f: any) => f.id);
                            if (
                              settings.activeSidebarItem === "bookmarks" &&
                              settings.activeBoardId === "1"
                            ) {
                              allIds.push("tabs");
                            }
                            setSettings((s) => ({
                              ...s,
                              collapsedSections: allIds,
                            }));
                          } else {
                            setSettings((s) => ({
                              ...s,
                              collapsedSections: [],
                            }));
                          }
                        }}
                      />
                    ) : (
                      <DashboardView
                        settings={settings}
                        onToggleClockMode={handleToggleClockMode}
                        reminders={reminders}
                        quickLinks={quickLinksData}
                        now={now}
                        topSites={topSites}
                        history={history}
                        onEditReminder={(r) => {
                          setModalForceType(null);
                          setModalInitialData({
                            ...r,
                            url: getCleanUrlFromUrl(r.url),
                            type: "reminder",
                          });
                          setIsModalOpen(true);
                        }}
                        onDeleteReminder={(id) => deleteItem(id)}
                        onCreateReminder={() => {
                          setModalForceType("reminder");
                          setModalInitialData(null);
                          setIsModalOpen(true);
                        }}
                        onAddQuickLink={() => {
                          setModalForceType("bookmark");
                          setModalInitialData({
                            id: "",
                            title: "",
                            url: "",
                            type: "quicklink" as any,
                          });
                          setIsModalOpen(true);
                        }}
                        onEditQuickLink={(link) => {
                          setModalInitialData({
                            ...link,
                            url: getCleanUrlFromUrl(link.url),
                            type: "quicklink" as any,
                          });
                          setModalForceType("bookmark");
                          setIsModalOpen(true);
                        }}
                        onDeleteQuickLink={(id) => deleteItem(id)}
                      />
                    )}
                  </div>
                </div>

                {settings.activeSidebarItem !== "dashboard" ? (
                  <aside className="flex flex-col gap-6 sticky top-4 h-fit max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pb-10">
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

                    {(looseBookmarks.length > 0 ||
                      (settings.activeSidebarItem !== "dashboard" &&
                        settings.activeSidebarItem !== "spaces")) && (
                      <SectionList
                        title="Quick Links"
                        items={looseBookmarks}
                        id="loose"
                        settings={settings}
                        searchQuery={searchQuery}
                        now={now}
                        draggingId={draggingId}
                        onToggleSection={handleToggleSection}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        onItemClick={handleCardClick}
                        onItemEdit={(item: any) => {
                          setModalInitialData(item);
                          setModalForceType("bookmark");
                          setIsModalOpen(true);
                        }}
                        onItemDelete={(item: any) => deleteItem(item.id)}
                      />
                    )}
                  </aside>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm">
                      <ClockWidget
                        now={now}
                        mode={settings.clockMode}
                        onToggle={handleToggleClockMode}
                      />
                    </div>
                    <div className="glass border border-border-card rounded-3xl overflow-hidden backdrop-blur-md shadow-sm">
                      <Calendar />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

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
