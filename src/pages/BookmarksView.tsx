import React, { useRef, useState, useEffect, useMemo } from "react";
import { SectionList } from "../components/SectionList";
import { Settings } from "../types";
import {
  Folder,
  LayoutList,
  Columns,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import { chromeApi } from "../utils/chrome";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DropAnimation,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { SortableColumn } from "../components/SortableColumn";
import { createPortal } from "react-dom";
import { Card } from "../components/Card";

interface BookmarksViewProps {
  settings: Settings;
  tabs: any[];
  flatFolders: any[];
  looseBookmarks: any[];
  searchQuery: string;
  now: number;
  draggingId: string | null;
  onToggleSection: (id: string) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onItemClick: (item: any, isTab?: boolean) => void;
  onItemEdit: (item: any) => void;
  onItemDelete: (item: any) => void;
  onTabClose: (item: any) => void;
  onCreateBookmark: () => void;
  onToggleViewMode?: () => void;
  onToggleAllSections?: (collapse: boolean) => void;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

// Unique ID helpers
const getUniqueId = (item: any, isTab: boolean) => {
  return isTab ? `tab-${item.id}` : `node-${item.id}`;
};

const parseUniqueId = (uniqueId: string) => {
  if (uniqueId.startsWith("tab-"))
    return { type: "tab", id: uniqueId.replace("tab-", "") };
  if (uniqueId.startsWith("node-"))
    return { type: "node", id: uniqueId.replace("node-", "") };
  return { type: "column", id: uniqueId };
};

/**
 * BookmarksView Component
 * This is the main "Kanban" board for managing bookmarks and tabs.
 * It uses `@dnd-kit` for sophisticated drag-and-drop interactions across columns.
 */
export function BookmarksView({
  settings,
  tabs,
  flatFolders,
  looseBookmarks,
  searchQuery,
  now,
  draggingId: propDraggingId,
  onToggleSection,
  onDrop: propOnDrop,
  onDragStart: propOnDragStart,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onTabClose,
  onCreateBookmark,
  onToggleViewMode,
  onToggleAllSections,
}: BookmarksViewProps) {
  // Determine if we are in Column (Board) view vs Standard List view
  const isColumnView = settings.gridMode === "vertical";

  // Calculate total sections for 'Collapse All' logic
  const totalSections =
    flatFolders.length +
    (settings.activeSidebarItem === "bookmarks" &&
    settings.activeBoardId === "1"
      ? 1
      : 0);

  // Check if everything is collapsed
  const isAllCollapsed =
    settings.collapsedSections.length >= totalSections && totalSections > 0;

  // Refs for horizontal scrolling
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY;
      }
    };

    header.addEventListener("wheel", handleWheel, { passive: false });
    return () => header.removeEventListener("wheel", handleWheel);
  }, []);

  // --- DND-Kit Local State ---
  const [activeId, setActiveId] = useState<string | null>(null); // ID of the currently dragged item
  const [activeItem, setActiveItem] = useState<any>(null); // Data of the currently dragged item (for overlay)
  const [localFolders, setLocalFolders] = useState<any[]>(flatFolders); // Optimistic UI state for folders

  // Flag to prevent prop-syncing while we are doing internal optimistic updates
  const isInternalUpdate = useRef(false);

  /**
   * Sync localFolders with incoming props (flatFolders)
   * Only happens when NOT dragging and NOT in the middle of an internal state transition.
   */
  useEffect(() => {
    if (!activeId && !isInternalUpdate.current) {
      setLocalFolders(flatFolders);
    }
    isInternalUpdate.current = false;
  }, [flatFolders, activeId]);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag (prevents accidental drags on click)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Helper to scroll the horizontal column view
   */
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  /**
   * Finds which "container" (column/folder) an item belongs to.
   * Uses ID prefixes to distinguish between tabs and bookmarks.
   */
  const findContainer = (uniqueId: string) => {
    const { type, id } = parseUniqueId(uniqueId);

    // Tabs always live in the "tabs" container
    if (type === "tab") return "tabs";

    // Folders check their own ID and their children's IDs
    for (const folder of localFolders) {
      if (folder.id === id) return folder.id;
      if (folder.children.find((item: any) => String(item.id) === id)) {
        return folder.id;
      }
    }
    return null;
  };

  /**
   * handleDragStart
   * Initializes state and data for the drag overlay.
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const uniqueId = String(active.id);
    const { type, id } = parseUniqueId(uniqueId);

    setActiveId(uniqueId);

    if (type === "tab") {
      const item = tabs.find((t) => String(t.id) === id);
      setActiveItem(item ? { ...item, isTab: true } : null);
    } else if (type === "column") {
      const column = localFolders.find((f) => f.id === uniqueId);
      if (column) setActiveItem({ ...column, isColumn: true });
    } else {
      // Find bookmark in localFolders
      for (const f of localFolders) {
        const item = f.children.find((c: any) => String(c.id) === id);
        if (item) {
          setActiveItem(item);
          break;
        }
      }
    }
  };

  /**
   * handleDragOver
   * Responsible for the "Optimistic UI" movement between columns.
   * This provides instant visual feedback while the drag is active.
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;
    if (!overId || active.id === overId) return;

    const activeUniqueId = String(active.id);
    const overUniqueId = String(over.id);

    // If dragging a column, handleDragEnd will do the reordering.
    const activeIsColumn = localFolders.some((f) => f.id === activeUniqueId);
    const overIsColumn = localFolders.some((f) => f.id === overUniqueId);
    if (activeIsColumn || overIsColumn) return;

    // Find source and destination containers
    const activeContainer = findContainer(activeUniqueId);
    let overContainer = findContainer(overUniqueId);

    // If hovering over an empty column, 'over' might be the container itself
    if (!overContainer) {
      if (localFolders.find((f) => f.id === overUniqueId))
        overContainer = overUniqueId;
      else if (overUniqueId === "tabs") overContainer = "tabs";
    }

    // Only handle cross-container bookmark movement here
    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    // Skip tab/bookmark cross-boundary visual movement for now to maintain stability
    if (activeContainer === "tabs" || overContainer === "tabs") return;

    // Perform optimistic movement between folder columns
    setLocalFolders((prev) => {
      const activeFolderIdx = prev.findIndex((f) => f.id === activeContainer);
      const overFolderIdx = prev.findIndex((f) => f.id === overContainer);
      if (activeFolderIdx === -1 || overFolderIdx === -1) return prev;

      const activeFolder = prev[activeFolderIdx];
      const overFolder = prev[overFolderIdx];
      const { id: rawActiveId } = parseUniqueId(activeUniqueId);

      const activeItemIndex = activeFolder.children.findIndex(
        (c: any) => String(c.id) === rawActiveId
      );
      if (activeItemIndex === -1) return prev;

      const activeItem = activeFolder.children[activeItemIndex];

      // Calculate new index in destination
      let newIndex;
      if (localFolders.find((f) => f.id === overUniqueId)) {
        // Dropped directly on column
        newIndex = overFolder.children.length;
      } else {
        // Dropped over an item in the column
        const { id: rawOverId } = parseUniqueId(overUniqueId);
        const overItemIndex = overFolder.children.findIndex(
          (c: any) => String(c.id) === rawOverId
        );
        newIndex =
          overItemIndex >= 0 ? overItemIndex : overFolder.children.length;
      }

      const newSourceChildren = [...activeFolder.children];
      newSourceChildren.splice(activeItemIndex, 1);
      const newDestChildren = [...overFolder.children];
      newDestChildren.splice(newIndex, 0, activeItem);

      const newFolders = [...prev];
      newFolders[activeFolderIdx] = {
        ...activeFolder,
        children: newSourceChildren,
      };
      newFolders[overFolderIdx] = { ...overFolder, children: newDestChildren };
      return newFolders;
    });
    isInternalUpdate.current = true;
  };

  /**
   * handleDragEnd
   * Persists the final state to the Chrome API after a drop.
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeUniqueId = String(active.id);
    const overUniqueId = over ? String(over.id) : null;

    // Reset local drag state
    setActiveId(null);
    setActiveItem(null);
    if (!overUniqueId) return;

    // --- 1. Column Reordering ---
    const activeColumnIndex = localFolders.findIndex(
      (f) => f.id === activeUniqueId
    );
    const overColumnIndex = localFolders.findIndex(
      (f) => f.id === overUniqueId
    );
    if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
      if (activeColumnIndex !== overColumnIndex) {
        setLocalFolders((items) =>
          arrayMove(items, activeColumnIndex, overColumnIndex)
        );
        // Persistence for column order could be added here (e.g. updating parent folder index)
      }
      return;
    }

    // --- 2. Item Reordering / Moving ---
    const { id: rawActiveId } = parseUniqueId(activeUniqueId);
    const activeContainer = findContainer(activeUniqueId);
    let overContainer = findContainer(overUniqueId);
    if (!overContainer) {
      if (localFolders.find((f) => f.id === overUniqueId))
        overContainer = overUniqueId;
      else if (overUniqueId === "tabs") overContainer = "tabs";
    }

    if (activeContainer && overContainer) {
      if (activeContainer === overContainer) {
        // REORDERING within same list
        if (activeContainer === "tabs") {
          const oldIndex = tabs.findIndex((t) => String(t.id) === rawActiveId);
          const { id: rawOverId } = parseUniqueId(overUniqueId);
          const newIndex = tabs.findIndex((t) => String(t.id) === rawOverId);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            chromeApi.moveTab(parseInt(rawActiveId), tabs[newIndex].index);
          }
        } else {
          const folderIdx = localFolders.findIndex(
            (f) => f.id === activeContainer
          );
          if (folderIdx !== -1) {
            const folder = localFolders[folderIdx];
            const oldIndex = folder.children.findIndex(
              (c: any) => String(c.id) === rawActiveId
            );
            const { id: rawOverId } = parseUniqueId(overUniqueId);
            const newIndex = folder.children.findIndex(
              (c: any) => String(c.id) === rawOverId
            );
            if (oldIndex !== newIndex) {
              const targetItem = folder.children[newIndex];
              if (targetItem?.index !== undefined) {
                await chromeApi.moveBookmark(rawActiveId, {
                  index: targetItem.index,
                });
              }
            }
          }
        }
      } else {
        // MOVING between containers
        if (activeContainer === "tabs") {
          // Tab -> Folder: Create Bookmark
          if (overContainer !== "tabs") {
            const tab = tabs.find((t) => String(t.id) === rawActiveId);
            if (tab) {
              await chromeApi.createBookmark({
                parentId: overContainer,
                title: tab.title,
                url: tab.url,
              });
            }
          }
        } else {
          // Bookmark -> Tabs: Open URL
          if (overContainer === "tabs") {
            const folder = localFolders.find((f) => f.id === activeContainer);
            const item = folder?.children.find(
              (c: any) => String(c.id) === rawActiveId
            );
            if (item && item.url) window.open(item.url, "_blank");
          } else {
            // Bookmark -> Folder: Move Bookmark
            await chromeApi.moveBookmark(rawActiveId, {
              parentId: overContainer,
            });
          }
        }
      }
    }
  };

  const columnsId = useMemo(
    () => localFolders.map((f) => f.id),
    [localFolders]
  );
  const showTabs =
    settings.activeSidebarItem === "bookmarks" &&
    settings.activeBoardId === "1";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      //   measuring={{ droppable: { strategy: 11 } }}
    >
      <div className="animate-in fade-in duration-300 h-full flex flex-col">
        <div
          ref={headerRef}
          className="flex items-center justify-between mb-6 group/header relative p-2 -m-2 rounded-xl hover:bg-white/5 transition-colors cursor-help"
          title="Scroll horizontally here using mouse wheel"
        >
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            My Bookmark
          </h1>
          <div className="flex items-center gap-3">
            {isColumnView && (
              <div className="flex items-center bg-bg-card border border-border-card rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => scroll("left")}
                  className="p-1.5 px-2 hover:bg-accent/10 hover:text-accent text-text-secondary transition-colors border-r border-border-card"
                  title="Scroll Left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-1.5 px-2 hover:bg-accent/10 hover:text-accent text-text-secondary transition-colors"
                  title="Scroll Right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            {onToggleViewMode && (
              <button
                onClick={onToggleViewMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-border-card hover:border-accent/40 text-text-secondary hover:text-text-primary transition-all shadow-sm"
              >
                {isColumnView ? (
                  <LayoutList size={16} />
                ) : (
                  <Columns size={16} />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isColumnView ? "List View" : "Board View"}
                </span>
              </button>
            )}
            {onToggleAllSections && (
              <button
                onClick={() => onToggleAllSections(!isAllCollapsed)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-border-card hover:border-accent/40 text-text-secondary hover:text-text-primary transition-all shadow-sm"
                title={isAllCollapsed ? "Expand All" : "Collapse All"}
              >
                {isAllCollapsed ? (
                  <ChevronsDown size={16} />
                ) : (
                  <ChevronsUp size={16} />
                )}
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                  {isAllCollapsed ? "Expand" : "Collapse"}
                </span>
              </button>
            )}
          </div>
        </div>

        {isColumnView ? (
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 pb-6 h-full items-start scroll-smooth px-2 no-scrollbar"
          >
            {showTabs && (
              <div className="w-[200px] flex-shrink-0">
                <SectionList
                  title="Running Tabs"
                  items={tabs}
                  id="tabs"
                  isTabSection
                  settings={settings}
                  searchQuery={searchQuery}
                  now={now}
                  draggingId={propDraggingId}
                  onToggleSection={onToggleSection}
                  onDrop={propOnDrop}
                  onDragStart={propOnDragStart}
                  onItemClick={(item) => onItemClick(item, true)}
                  onItemEdit={() => {}}
                  onItemDelete={onTabClose}
                  onItemClose={onTabClose}
                  isSortable={true}
                  idPrefix="tab-"
                />
              </div>
            )}
            <SortableContext
              items={columnsId}
              strategy={horizontalListSortingStrategy}
            >
              {localFolders.map((folder: any) => (
                <SortableColumn
                  key={folder.id}
                  id={folder.id}
                  className="w-[200px] flex-shrink-0"
                >
                  {(dragListeners) => (
                    <SectionList
                      title={folder.title}
                      items={folder.children}
                      id={folder.id}
                      settings={settings}
                      searchQuery={searchQuery}
                      now={now}
                      draggingId={propDraggingId}
                      onToggleSection={onToggleSection}
                      onDrop={propOnDrop}
                      onDragStart={propOnDragStart}
                      onItemClick={onItemClick}
                      onItemEdit={onItemEdit}
                      onItemDelete={onItemDelete}
                      dragListeners={dragListeners}
                      isSortable={true}
                      idPrefix="node-"
                    />
                  )}
                </SortableColumn>
              ))}
            </SortableContext>
          </div>
        ) : (
          <div className="space-y-6">
            {showTabs && (
              <SectionList
                title="Running Tabs"
                items={tabs}
                id="tabs"
                isTabSection
                settings={settings}
                searchQuery={searchQuery}
                now={now}
                draggingId={propDraggingId}
                onToggleSection={onToggleSection}
                onDrop={propOnDrop}
                onDragStart={propOnDragStart}
                onItemClick={(item) => onItemClick(item, true)}
                onItemEdit={() => {}}
                onItemDelete={onTabClose}
                onItemClose={onTabClose}
                isSortable={true}
                idPrefix="tab-"
              />
            )}
            {flatFolders.map((folder: any) => (
              <SectionList
                key={folder.id}
                title={folder.title}
                items={folder.children}
                id={folder.id}
                settings={settings}
                searchQuery={searchQuery}
                now={now}
                draggingId={propDraggingId}
                onToggleSection={onToggleSection}
                onDrop={propOnDrop}
                onDragStart={propOnDragStart}
                onItemClick={onItemClick}
                onItemEdit={onItemEdit}
                onItemDelete={onItemDelete}
              />
            ))}
          </div>
        )}

        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeItem && (
              <div className={activeItem.isColumn ? "w-[200px]" : "w-full"}>
                {activeItem.isColumn ? (
                  <div className="bg-bg-card border border-border-card rounded-2xl p-4 shadow-xl opacity-90 h-[200px] flex flex-col">
                    <div className="font-bold text-text-primary mb-2 flex items-center justify-between">
                      {activeItem.title}
                      <span className="text-xs bg-border-card px-1.5 py-0.5 rounded-full">
                        {activeItem.children?.length}
                      </span>
                    </div>
                    <div className="bg-bg/20 flex-1 rounded-lg border border-dashed border-text-secondary/20 flex items-center justify-center text-text-secondary/50 text-xs">
                      Column Preview
                    </div>
                  </div>
                ) : (
                  <Card
                    item={activeItem}
                    now={now}
                    viewMode="grid"
                    isTab={activeItem.isTab}
                  />
                )}
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </div>
    </DndContext>
  );
}
