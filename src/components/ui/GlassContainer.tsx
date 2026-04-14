import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassContainerProps extends Omit<HTMLMotionProps<"div">, "onDragStart" | "onDragEnd" | "onDrag"> {
  children: React.ReactNode;
  className?: string;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onDragEnd?: React.DragEventHandler<HTMLDivElement>;
  onDrag?: React.DragEventHandler<HTMLDivElement>;
}

export function GlassContainer({ children, className = "", ...props }: GlassContainerProps) {
  return (
    <motion.div
      className={`glass backdrop-blur-md rounded-xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

