import React, { useState } from "react";
import { Settings } from "@/types";
import { chromeApi } from "@/utils/chrome";
import { EditData, EditModalProps } from "@/common/EditModal";
import { encodeMetaToUrl, decodeMetaFromUrl } from "@/utils/metadata";

interface UseAppHandlersProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  refreshData: () => Promise<void>;
  tabStackFolderId: string | null;
  notesFolderId: string | null;
  remindersFolderId: string | null;
  quickLinksFolderId: string | null;
  watchlistFolderId: string | null;
  mostVisitedFolderId: string | null;
  metadata: Record<string, any>;
  setMetadata: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  tree: chrome.bookmarks.BookmarkTreeNode[];
  tabs: chrome.tabs.Tab[];
  allBookmarks: any[];
}

export function useAppHandlers({
  settings,
  setSettings,
  refreshData,
  tabStackFolderId,
  notesFolderId,
  remindersFolderId,
  quickLinksFolderId,
  watchlistFolderId,
  mostVisitedFolderId,
  metadata,
  setMetadata,
  tree,
  tabs,
  allBookmarks,
}: UseAppHandlersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [modalForceType, setModalForceType] = useState<EditModalProps["forceType"]>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
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
      id === remindersFolderId ||
      id === quickLinksFolderId ||
      id === watchlistFolderId ||
      id === mostVisitedFolderId
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
        try {
          await chromeApi.removeTree(id);
          setSettings((s) => {
            const newSettings = { ...s };
            if (isBoard) {
              newSettings.boards = s.boards.filter((b) => b.id !== id);
              if (s.activeBoardId === id) {
                newSettings.activeBoardId = tabStackFolderId || "1";
              }
            }
            return newSettings;
          });
          refreshData();
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        } catch (e) {
          console.error("Delete failed", e);
        }
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
      a.download = `tabstack-backup-${new Date().toISOString().split("T")[0]}.json`;
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
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        } catch (e) {
          console.error("Force sync failed", e);
        }
      },
    });
  };

  const handleSaveEdit = async (data: EditData) => {
    const { id, title, url, type, description, deadline } = data;
    const effectiveType =
      type === "bookmark" && settings.activeSidebarItem === "watchlist"
        ? "watchlist"
        : type;
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
            : type === "mostvisited"
            ? mostVisitedFolderId || "1"
            : settings.activeTab !== "tabs"
            ? settings.activeTab
            : settings.activeBoardId;
        const createParams: any = {
          parentId: parentId === "tabs" || parentId === "Space" ? "1" : parentId,
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
          } else if (type === "mostvisited" && node.parentId !== mostVisitedFolderId) {
            await chromeApi.moveBookmark(id, { parentId: mostVisitedFolderId! });
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
      const tab = tabs.find((t) => String(t.id) === sourceId);

      if (parentId === "tabs") {
        if (!tab) {
          const bookmark = allBookmarks.find((b) => String(b.id) === sourceId);
          if (bookmark && bookmark.url) {
            window.open(bookmark.url, "_blank");
          }
        }
      } else {
        if (tab) {
          await chromeApi.createBookmark({
            parentId,
            title: tab.title,
            url: tab.url,
          });
        } else {
          await chromeApi.moveBookmark(sourceId, { parentId });
        }
      }
      refreshData();
    } catch (err) {
      console.error("Drag and Drop failed", err);
    }
    setDraggingId(null);
  };

  const handleCardClick = (item: any, isTab = false) => {
    if (isTab) {
      chromeApi.activateTab(item.id);
    } else if (item.children) {
      const section = document.getElementById(`section-${item.id}`);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        if (settings.collapsedSections.includes(String(item.id))) {
          handleToggleSection(String(item.id));
        }
      }
    } else if (item.url) {
      window.location.href = item.url;
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    modalInitialData,
    setModalInitialData,
    modalForceType,
    setModalForceType,
    draggingId,
    setDraggingId,
    confirmState,
    setConfirmState,
    handleToggleSection,
    handleToggleClockMode,
    deleteItem,
    handleExportData,
    handleImportData,
    handleForceSync,
    handleSaveEdit,
    handleCreateBoard,
    handleDragStart,
    handleDrop,
    handleCardClick,
  };
}
