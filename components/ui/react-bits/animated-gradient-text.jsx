"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const AnimatedGradientText = ({
  children,
  className = "",
  gradient = "from-zinc-900 via-emerald-600 to-zinc-800 dark:from-white dark:via-emerald-400 dark:to-zinc-300",
  ...props
}) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] font-extrabold tracking-tight inline-block",
        gradient,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default AnimatedGradientText;
