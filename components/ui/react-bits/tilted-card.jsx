"use client";

import React, { useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

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

export const TiltedCard = ({
  children,
  className = "",
  maxTilt = 12,
  perspective = 1000,
  scaleOnHover = 1.02,
  ...props
}) => {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const supportsHover = useSupportsHover();

  const handleMouseMove = (e) => {
    if (!cardRef.current || !supportsHover) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (-(y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(
      `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, ${scaleOnHover})`
    );
  };

  const handleMouseEnter = () => {
    if (supportsHover) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle(
      `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        willChange: "transform",
      }}
      className={cn("relative transition-all duration-300", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default TiltedCard;
