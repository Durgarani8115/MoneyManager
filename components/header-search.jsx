"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, Command, ArrowRight, Tag, Home, PlusCircle, BarChart3, X } from "lucide-react";
import { defaultCategories } from "@/data/categories";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredCategories = useMemo(() => {
    if (!query) return defaultCategories.slice(0, 8);
    return defaultCategories.filter((cat) =>
      cat.name.toLowerCase().includes(query.toLowerCase()) ||
      cat.subcategories?.some((s) => s.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query]);

  const handleSelectCategory = (catId) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/transaction/create?category=${catId}`);
  };

  const handleNavigate = (path) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  return (
    <>
      {/* Trigger Bar in Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2.5 h-9 w-64 md:w-80 px-3 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs cursor-pointer"
      >
        <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
        <span className="truncate flex-1 text-left">Search transactions, categories...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-zinc-400">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Search Modal Overlay — portalled to body to escape header's backdrop-blur stacking context */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            {/* Backdrop Click to Close */}
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

            <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
              {/* Input Header */}
              <div className="flex items-center gap-3 px-4 border-b border-zinc-200 dark:border-zinc-800">
                <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a category, action, or view..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-12 text-sm bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Results Body */}
              <div className="p-2 max-h-80 overflow-y-auto space-y-3">
                {/* Quick Pages */}
                {!query && (
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-3 py-1">
                      Quick Navigation
                    </p>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => handleNavigate("/dashboard")}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <div className="flex items-center gap-2.5">
                          <Home className="h-4 w-4 text-zinc-500" />
                          <span>Dashboard</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => handleNavigate("/transaction/create")}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <div className="flex items-center gap-2.5">
                          <PlusCircle className="h-4 w-4 text-zinc-500" />
                          <span>Add New Transaction</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Categories Search Results */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-3 py-1">
                    Categories ({filteredCategories.length})
                  </p>
                  {filteredCategories.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6">
                      No matching categories found for &quot;{query}&quot;
                    </p>
                  ) : (
                    <div className="space-y-0.5">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.id)}
                          className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: cat.color || "#27272a" }}
                            >
                              <Tag className="h-3 w-3" />
                            </div>
                            <span className="truncate">{cat.name}</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              {cat.type}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Press <kbd className="font-semibold text-zinc-600 dark:text-zinc-300">Esc</kbd> to exit</span>
                <span>Search Trakex Finance</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default HeaderSearch;
