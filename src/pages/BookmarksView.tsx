import React from 'react';
import { SectionList } from '../components/SectionList';
import { Settings } from '../types';
import { Folder } from 'lucide-react';
import { chromeApi } from '../utils/chrome';

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
}: BookmarksViewProps) {
  return (
    <div className="animate-in fade-in duration-300">
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

      {settings.gridMode === "vertical" ? (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-20">
          {flatFolders.map((folder: any) => (
            <SectionList
              key={folder.id}
              title={folder.title}
              items={folder.children}
              id={folder.id}
              isMasonry
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
      ) : (
        flatFolders.map((folder: any) => (
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
        ))
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
