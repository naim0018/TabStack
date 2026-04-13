import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
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

