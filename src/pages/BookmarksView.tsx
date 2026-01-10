import React from "react";
import { SectionList } from "../components/SectionList";
import { Settings } from "../types";
import { Folder, LayoutList, Columns } from "lucide-react";
import { chromeApi } from "../utils/chrome";

interface BookmarksViewProps {
  settings: Settings;
  tabs: any[];
  flatFolders: any[];
  looseBookmarks: any[]; // Used for empty check
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
}

export function BookmarksView({
  settings,
  tabs,
  flatFolders,
  looseBookmarks,
  searchQuery,
  now,
  draggingId,
  onToggleSection,
  onDrop,
  onDragStart,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onTabClose,
  onCreateBookmark,
  onToggleViewMode,
}: BookmarksViewProps) {
  const isColumnView = settings.gridMode === "vertical";

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-text-primary tracking-tight">
          My Bookmark
        </h1>
        {onToggleViewMode && (
          <button
            onClick={onToggleViewMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-border-card hover:border-accent/40 text-text-secondary hover:text-text-primary transition-all shadow-sm"
          >
            {isColumnView ? <LayoutList size={16} /> : <Columns size={16} />}
            <span className="text-xs font-bold uppercase tracking-wider">
              {isColumnView ? "List View" : "Board View"}
            </span>
          </button>
        )}
      </div>

      {isColumnView ? (
        /* Horizontal Scrolling Column View */
        <div className="flex overflow-x-auto gap-6 pb-6 h-full items-start snap-x">
          {/* Running Tabs Column */}
          {settings.activeSidebarItem === "bookmarks" &&
            settings.activeBoardId === "1" && (
              <div className="w-[220px] flex-shrink-0 snap-start">
                <SectionList
                  title="Running Tabs"
                  items={tabs}
                  id="tabs"
                  isTabSection
                  settings={settings}
                  searchQuery={searchQuery}
                  now={now}
                  draggingId={draggingId}
                  onToggleSection={onToggleSection}
                  onDrop={onDrop}
                  onDragStart={onDragStart}
                  onItemClick={(item) => onItemClick(item, true)}
                  onItemEdit={() => {}}
                  onItemDelete={onTabClose}
                  onItemClose={onTabClose}
                />
              </div>
            )}

          {/* Folder Columns */}
          {flatFolders.map((folder: any) => (
            <div key={folder.id} className="w-[220px] flex-shrink-0 snap-start">
              <SectionList
                title={folder.title}
                items={folder.children}
                id={folder.id}
                settings={settings}
                searchQuery={searchQuery}
                now={now}
                draggingId={draggingId}
                onToggleSection={onToggleSection}
                onDrop={onDrop}
                onDragStart={onDragStart}
                onItemClick={onItemClick}
                onItemEdit={onItemEdit}
                onItemDelete={onItemDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Standard Vertical List View */
        <div className="space-y-6">
          {settings.activeSidebarItem === "bookmarks" &&
            settings.activeBoardId === "1" && (
              <SectionList
                title="Running Tabs"
                items={tabs}
                id="tabs"
                isTabSection
                settings={settings}
                searchQuery={searchQuery}
                now={now}
                draggingId={draggingId}
                onToggleSection={onToggleSection}
                onDrop={onDrop}
                onDragStart={onDragStart}
                onItemClick={(item) => onItemClick(item, true)}
                onItemEdit={() => {}}
                onItemDelete={onTabClose}
                onItemClose={onTabClose}
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
              draggingId={draggingId}
              onToggleSection={onToggleSection}
              onDrop={onDrop}
              onDragStart={onDragStart}
              onItemClick={onItemClick}
              onItemEdit={onItemEdit}
              onItemDelete={onItemDelete}
            />
          ))}
        </div>
      )}
      {flatFolders.length === 0 &&
        looseBookmarks.length === 0 &&
        tabs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Folder size={48} className="mb-4 text-accent" />
            <p>This space is empty</p>
            <button
              onClick={onCreateBookmark}
              className="mt-4 text-accent hover:underline"
            >
              Add a bookmark
            </button>
          </div>
        )}
    </div>
  );
}
