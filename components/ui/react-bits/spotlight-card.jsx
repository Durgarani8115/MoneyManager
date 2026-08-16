"use client";

import React, { useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};
const getIsMounted = () => true;
const getIsMountedServer = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getIsMounted, getIsMountedServer);
}

const hoverSubscribe = (callback) => {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(hover: hover)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
};

const getHoverSnapshot = () => {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover)").matches;
};

function useSupportsHover() {
  return useSyncExternalStore(hoverSubscribe, getHoverSnapshot, () => true);
}

export const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(16, 185, 129, 0.15)", // Dashboard Emerald Glow
  spotlightSize = 350,
  borderGlow = true,
  ...props
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const mounted = useIsMounted();
  const supportsHover = useSupportsHover();

  const handleMouseMove = (e) => {
    if (!divRef.current || !supportsHover) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    if (supportsHover) setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl transition-colors duration-300 shadow-xs hover:border-emerald-500/40 dark:hover:border-emerald-500/40",
        className
      )}
      {...props}
    >
      {/* Spotlight Effect Layer */}
      {mounted && supportsHover && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-2xl"
          style={{
            opacity,
            background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Border Glow Beam */}
      {borderGlow && mounted && supportsHover && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            opacity: opacity * 0.6,
            background: `radial-gradient(200px circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.4), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default SpotlightCard;
