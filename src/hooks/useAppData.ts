import { useState, useEffect, useMemo, useRef } from "react";
import { Settings, DEFAULT_SETTINGS } from "@/types";
import { chromeApi } from "@/utils/chrome";
import { enrichItem } from "@/utils/metadata";

export function useAppData() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const isProcessingSync = useRef(false);
  const isMoving = useRef(false);

  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [tree, setTree] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [topSites, setTopSites] = useState<chrome.topSites.MostVisitedURL[]>([]);
  const [history, setHistory] = useState<chrome.history.HistoryItem[]>([]);

  const [tabStackFolderId, setTabStackFolderId] = useState<string | null>(null);
  const [notesFolderId, setNotesFolderId] = useState<string | null>(null);
  const [remindersFolderId, setRemindersFolderId] = useState<string | null>(null);
  const [quickLinksFolderId, setQuickLinksFolderId] = useState<string | null>(null);
  const [watchlistFolderId, setWatchlistFolderId] = useState<string | null>(null);
  const [mostVisitedFolderId, setMostVisitedFolderId] = useState<string | null>(null);

  const [now, setNow] = useState(new Date());

  const refreshData = async () => {
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

      let tsParent = findFolder(tr, "TabStack", "1");
      if (!tsParent) {
        tsParent = findFolder(tr, "TabStack");
      }

      if (!tsParent) {
        isMoving.current = true;
        tsParent = await chromeApi.createBookmark({
          parentId: "1",
          title: "TabStack",
        });
        isMoving.current = false;
        const updatedTree = await chromeApi.getTree();
        setTree(updatedTree);
        if (tr && updatedTree[0]) tr[0] = updatedTree[0];
      }
      setTabStackFolderId(tsParent.id);

      // Notes
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

      // Reminders
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

      // QuickLinks
      let qlFolderNode = findFolder(tr, "QuickLinks", "1");
      if (!qlFolderNode) {
        qlFolderNode = findFolder(tr, "QuickLinks");
      }

      if (!qlFolderNode) {
        isMoving.current = true;
        qlFolderNode = await chromeApi.createBookmark({
          parentId: "1",
          title: "QuickLinks",
        });
        isMoving.current = false;
        const updatedTree = await chromeApi.getTree();
        setTree(updatedTree);
      }
      setQuickLinksFolderId(qlFolderNode.id);

      // Watchlist
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
        const updatedTree = await chromeApi.getTree();
        setTree(updatedTree);
        tr[0] = updatedTree[0];
        tsParent = findFolder(updatedTree, "TabStack");
        wlFolderNode = findFolder(tsParent.children || [], "Watchlist", tsParent.id);
      }
      setWatchlistFolderId(wlFolderNode.id);

      // MostVisited
      let mvFolderNode = findFolder(
        tsParent.children || [],
        "MostVisited",
        tsParent.id
      );
      if (!mvFolderNode) {
        isMoving.current = true;
        mvFolderNode = await chromeApi.createBookmark({
          parentId: tsParent.id,
          title: "MostVisited",
        });
        isMoving.current = false;
        const updatedTree = await chromeApi.getTree();
        setTree(updatedTree);
        tr[0] = updatedTree[0];
        tsParent = findFolder(updatedTree, "TabStack");
        mvFolderNode = findFolder(tsParent.children || [], "MostVisited", tsParent.id);
      }
      setMostVisitedFolderId(mvFolderNode.id);

      // Migrate legacy boards
      const rootNodes = tr[0]?.children || [];
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

      // Move out-of-place items
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

      // Discover boards
      if (tr && tr.length > 0) {
        const tsChildren = tsParent.children || [];
        const discoveredBoards = tsChildren
          .filter(
            (node: any) =>
              !node.url &&
              node.id !== notesFolderNode?.id &&
              node.id !== remFolderNode?.id &&
              node.id !== wlFolderNode?.id &&
              node.id !== mvFolderNode?.id
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
            existing.id = d.id;
          }
        });

        const updatedBoards = mergedBoards.map(b => {
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
            return { ...b, id: node.id };
          }
          return b;
        });

        if (JSON.stringify(updatedBoards) !== JSON.stringify(settings.boards)) {
          setSettings((s) => ({ ...s, boards: updatedBoards }));
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

    const ticker = setInterval(() => setNow(new Date()), 60000);

    if (typeof chrome !== "undefined" && chrome.bookmarks) {
      const handler = () => refreshData();
      chrome.bookmarks.onCreated.addListener(handler);
      chrome.bookmarks.onRemoved.addListener(handler);
      chrome.bookmarks.onChanged.addListener(handler);
      chrome.bookmarks.onMoved.addListener(handler);

      const storageHandler = async (changes: any, area: string) => {
        if (area === "sync" && changes.appSettings) {
          isProcessingSync.current = true;
          const resolved = await chromeApi.resolveLocalSettings(changes.appSettings.newValue);
          setSettings(resolved);
          setTimeout(() => { isProcessingSync.current = false; }, 200);
        }
      };
      chrome.storage.onChanged.addListener(storageHandler);

      if (chrome.tabs) {
        chrome.tabs.onCreated.addListener(handler);
        chrome.tabs.onRemoved.addListener(handler);
        chrome.tabs.onUpdated.addListener(handler);
      }
      return () => {
        clearInterval(ticker);
        chrome.bookmarks.onCreated.removeListener(handler);
        chrome.bookmarks.onRemoved.removeListener(handler);
        chrome.bookmarks.onChanged.removeListener(handler);
        chrome.bookmarks.onMoved.removeListener(handler);
        chrome.storage.onChanged.removeListener(storageHandler);
        if (chrome.tabs) {
          chrome.tabs.onCreated.removeListener(handler);
          chrome.tabs.onRemoved.removeListener(handler);
          chrome.tabs.onUpdated.removeListener(handler);
        }
      };
    }
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (isSettingsLoaded && !isProcessingSync.current) {
      chromeApi.saveSettings(settings);
    }
    document.body.setAttribute("data-theme", settings.theme);
  }, [settings, isSettingsLoaded]);

  // Memos
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
      const collect = (node: any, isRoot: boolean) => {
        if (node.children) {
          if (
            node.id === notesFolderId ||
            node.id === remindersFolderId ||
            node.id === tabStackFolderId ||
            node.id === watchlistFolderId ||
            node.id === mostVisitedFolderId ||
            node.id === quickLinksFolderId
          )
            return;

          if (!isRoot) flat.push(node);
          node.children.forEach((child: any) => {
            if (
              child.id === notesFolderId ||
              child.id === remindersFolderId ||
              child.id === tabStackFolderId ||
              child.id === watchlistFolderId ||
              child.id === mostVisitedFolderId ||
              child.id === quickLinksFolderId
            )
              return;

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
    watchlistFolderId,
    mostVisitedFolderId,
    quickLinksFolderId,
    metadata
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

  const mostVisitedData = useMemo(() => {
    if (!mostVisitedFolderId || !tree || tree.length === 0) return [];
    const findFolder = (nodes: any[]): any => {
      for (let n of nodes) {
        if (n.id === mostVisitedFolderId) return n;
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
  }, [tree, mostVisitedFolderId, metadata]);

  return {
    settings,
    setSettings,
    tabs,
    tree,
    metadata,
    topSites,
    history,
    now,
    flatFolders,
    looseBookmarks,
    allBookmarks,
    reminders,
    notes,
    quickLinksData,
    watchlistData,
    mostVisitedData,
    refreshData,
    setMetadata,
    tabStackFolderId,
    notesFolderId,
    remindersFolderId,
    quickLinksFolderId,
    watchlistFolderId,
    mostVisitedFolderId,
  };
}
