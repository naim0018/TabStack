import React from "react";
import { TabCard } from "@/pages/Dashboard/Overview/Components/Cards/TabCard";
import { NoteCard } from "@/pages/Dashboard/Overview/Components/Cards/NoteCard";
import { ReminderCard } from "@/pages/Dashboard/Overview/Components/Cards/ReminderCard";
import { FolderCard } from "@/pages/Dashboard/Overview/Components/Cards/FolderCard";
import { BookmarkCard } from "@/pages/Dashboard/Overview/Components/Cards/BookmarkCard";

export interface CardItem {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
  favIconUrl?: string; // For tabs
  children?: CardItem[]; // For folders
  description?: string;
  deadline?: string;
  type?: "bookmark" | "folder" | "reminder" | "tab" | "note";
}

interface CardProps {
  item: CardItem;
  isTab?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void; // For tabs
  onDragStart?: (e: React.DragEvent) => void;
  now?: number; // For countdowns
  viewMode?: "grid" | "list";
}

export function Card({
  item,
  isTab,
  onClick,
  onEdit,
  onDelete,
  onClose,
  onDragStart,
  now = Date.now(),
  viewMode = "grid",
}: CardProps) {
  const isFolder = item.children !== undefined || item.type === "folder";
  const isNote = item.type === "note";
  const isReminder = item.type === "reminder" || !!item.deadline;

  if (isTab) {
    return (
      <TabCard
        item={item}
        onClose={onClose}
        onClick={onClick}
        onDragStart={onDragStart}
        viewMode={viewMode}
      />
    );
  }

  if (isNote) {
    return (
      <NoteCard
        item={item}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onDragStart={onDragStart}
        viewMode={viewMode}
      />
    );
  }

  if (isReminder) {
    return (
      <ReminderCard
        item={item}
        now={now}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onDragStart={onDragStart}
        viewMode={viewMode}
      />
    );
  }

  if (isFolder) {
    return (
      <FolderCard
        item={item}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onDragStart={onDragStart}
        viewMode={viewMode}
      />
    );
  }

  return (
    <BookmarkCard
      item={item}
      onClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
      onDragStart={onDragStart}
      viewMode={viewMode}
    />
  );
}
