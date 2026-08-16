"use client";

import React, { useEffect, useState, useRef, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getIsMounted = () => true;
const getIsMountedServer = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getIsMounted, getIsMountedServer);
}

export const AnimatedCounter = ({ value, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const mounted = useIsMounted();
  const ref = useRef(null);
  const numericTarget = parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0;

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic formula
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setCount(easeOutProgress * numericTarget);

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(step);
            }
          };
          animationFrameId = requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [numericTarget, duration]);

  if (!mounted) {
    return <span ref={ref}>{prefix}{value}{suffix}</span>;
  }

  // Format integer vs decimal
  const formattedCount = Number.isInteger(numericTarget)
    ? Math.floor(count).toLocaleString()
    : count.toFixed(1);

  return (
    <span ref={ref} className="font-extrabold tracking-tight">
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
