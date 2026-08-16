"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * ThemeToggle component allowing users to switch between Day (Light) and Night (Dark) mode.
 */
export function ThemeToggle({ className = "" }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting until component mounts
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className={`h-9 w-9 border-zinc-300 dark:border-zinc-700 ₹{className}`} disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`h-9 w-9 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 transition-all ₹{className}`}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
          ) : (
            <Moon className="h-4 w-4 text-zinc-800 transition-transform duration-300 rotate-0 scale-100" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs">{isDark ? "Switch to Day Mode" : "Switch to Night Mode"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
