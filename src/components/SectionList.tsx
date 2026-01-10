import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from './Card';
import { Settings } from '../types';

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
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onItemClick: (item: any) => void;
  onItemEdit: (item: any) => void;
  onItemDelete: (item: any) => void;
  onItemClose?: (item: any) => void;
}

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
}: SectionListProps) {
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
      className={`w-full group/section transition-all ${
        draggingId ? "scale-[0.99] opacity-80" : ""
      } ${
        isMasonry
          ? "break-inside-avoid mb-6 bg-bg-card border border-border-card rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-accent/30"
          : "mb-8"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => !isTabSection && onDrop(e, id)}
    >
      <div
        className={`flex items-center gap-2 cursor-pointer select-none ${
          isMasonry ? "mb-3" : "mb-4"
        }`}
        onClick={() => onToggleSection(id)}
      >
        <div
          className={`p-1 rounded-md text-text-secondary hover:bg-border-card transition-all ${
            isCollapsed ? "-rotate-90" : ""
          }`}
        >
          <ChevronDown size={14} />
        </div>
        <h3
          className={`font-bold text-text-primary/90 flex items-center gap-2 uppercase tracking-tight ${
            isMasonry ? "text-[13px]" : "text-[14px]"
          }`}
        >
          {title}
          <span className="text-text-secondary text-xs font-medium opacity-40 ml-1 bg-border-card px-1.5 rounded-full">
            {items.length}
          </span>
        </h3>
      </div>

      {!isCollapsed && (
        <div
          className={
            isMasonry
              ? "flex flex-col gap-1"
              : `grid ${
                  settings.gridMode === "horizontal"
                    ? "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
                    : "flex flex-col"
                } gap-4 animate-in fade-in slide-in-from-top-2 duration-300`
          }
        >
          {filteredItems.map((item: any) => (
            <Card
              key={item.id || item.title}
              item={item}
              now={now}
              isTab={isTabSection}
              viewMode={isMasonry ? "list" : "grid"}
              onClick={() => onItemClick(item)}
              onEdit={() => onItemEdit(item)}
              onDelete={() => onItemDelete(item)}
              onClose={() => onItemClose?.(item)}
              onDragStart={(e) => onDragStart(e, String(item.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
