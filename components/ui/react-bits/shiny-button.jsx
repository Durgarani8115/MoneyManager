"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const ShinyButton = ({
  children,
  className = "",
  variant = "primary", // "primary" or "secondary"
  onClick,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-md hover:shadow-emerald-500/20",
        variant === "primary"
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white border border-zinc-800 dark:border-zinc-200"
          : "bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50",
        className
      )}
      {...props}
    >
      {/* Shimmer Light Reflection Pass */}
      <span className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent opacity-0 transition-all duration-1000 group-hover:left-full group-hover:opacity-100" />
      
      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};

export default ShinyButton;
