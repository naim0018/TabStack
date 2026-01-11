import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableColumnProps {
  id: string;
  children: (dragListeners: any) => React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SortableColumn({ id, children, disabled, className }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
    data: {
      type: "Column",
      column: { id },
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
    >
      {children(listeners)}
    </div>
  );
}
