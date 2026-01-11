import React, { useMemo } from "react";
import { Card } from "./Card";
import { Settings } from "../types";
import { GripVertical } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

interface SectionListProps {
  title: string;
  items: any[];
  id: string;
  isTabSection?: boolean;
  isMasonry?: boolean;
  settings: Settings;
  searchQuery: string;
  now: number;
  draggingId: string | null;
  onToggleSection: (id: string) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onItemClick: (item: any, isTab?: boolean) => void;
  onItemEdit: (item: any) => void;
  onItemDelete: (item: any) => void;
  onItemClose?: (item: any) => void;
  dragListeners?: any; // For dnd-kit column dragging
  isSortable?: boolean; // Enable dnd-kit for items
  idPrefix?: string; // Prefix for dnd-kit IDs to avoid collisions
}

/**
 * SectionList Component
 * Renders a list of bookmarks or tabs within a column.
 * It is used for both the standard vertical list and the Kanban sortable columns.
 */
export function SectionList({
  title,
  items,
  id,
  isTabSection = false,
  isMasonry = false,
  settings,
  searchQuery,
  now,
  draggingId,
  onToggleSection,
  onDrop,
  onDragStart,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onItemClose,
  dragListeners,
  isSortable = false,
  idPrefix = "",
}: SectionListProps) {
  const filteredItems = useMemo(() => {
    if (!items) return [];
    return searchQuery
      ? items.filter((i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items;
  }, [items, searchQuery]);

  if ((!filteredItems || filteredItems.length === 0) && searchQuery) return null;

  const isCollapsed = settings.collapsedSections.includes(id);

  const itemIds = useMemo(() => filteredItems.map(item => `${idPrefix}${item.id || item.title}`), [filteredItems, idPrefix]);

  const content = (
    <div
      className={
        isMasonry
          ? "flex flex-col gap-1"
          : `grid ${
              settings.gridMode === "horizontal"
                ? "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]"
                : "flex flex-col"
            } gap-5 animate-in fade-in slide-in-from-top-2 duration-300 min-h-[50px] transition-all`
      }
    >
      {filteredItems.map((item: any) => {
        const rawId = String(item.id || item.title);
        const uniqueId = `${idPrefix}${rawId}`;
        const cardNode = (
           <Card
              item={item}
              now={now}
              isTab={isTabSection}
              viewMode={isMasonry ? "list" : "grid"}
              onClick={() => onItemClick(item)}
              onEdit={() => onItemEdit(item)}
              onDelete={() => onItemDelete(item)}
              onClose={() => onItemClose?.(item)}
              onDragStart={!isSortable ? (e) => onDragStart(e, rawId) : undefined}
            />
        );

        if (isSortable) {
          return (
            <SortableItem
              key={uniqueId}
              id={uniqueId}
              className={isTabSection ? "" : "min-h-0"}
            >
              {cardNode}
            </SortableItem>
          );
        }
        return <React.Fragment key={uniqueId}>{cardNode}</React.Fragment>;
      })}
    </div>
  );

  return (
    <div
      id={`section-${id}`}
      className={`w-full group/section transition-all h-full flex flex-col ${
        draggingId && !isSortable ? "scale-[0.99] opacity-80" : ""
      } ${isCollapsed ? "h-auto" : ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, id)}
    >
      <div
        className={`flex items-center gap-2 select-none justify-between mb-4 ${
          isCollapsed ? "mb-0" : ""
        }`}
      >
        <div 
          className="flex items-center gap-2 cursor-pointer group/title"
          onClick={() => onToggleSection(id)}
        >
           <div className={`p-1 rounded-md text-text-secondary group-hover/title:bg-border-card transition-all ${isCollapsed ? "-rotate-90" : ""}`}>
             <ChevronDown size={14} />
           </div>
           <h3 className="text-[14px] font-bold text-text-primary/90 flex items-center gap-2 uppercase tracking-wide">
             {title}
             <span className="text-text-secondary text-[10px] font-bold opacity-30 ml-1 bg-border-card px-1.5 py-0.5 rounded-full">
               {filteredItems.length}
             </span>
           </h3>
        </div>

        {dragListeners && (
           <div 
            {...dragListeners} 
            className="p-1.5 text-text-secondary/40 hover:text-text-secondary hover:bg-border-card rounded cursor-grab active:cursor-grabbing"
           >
             <GripVertical size={16} />
           </div>
        )}
      </div>

      {!isCollapsed && (
         isSortable ? (
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              {content}
            </SortableContext>
         ) : content
      )}
    </div>
  );
}

function ChevronDown({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
