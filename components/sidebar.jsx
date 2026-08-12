"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { defaultCategories } from "@/data/categories";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Wallet,
  Laptop,
  TrendingUp,
  Building,
  Home,
  Plus,
  Car,
  ShoppingBag,
  Zap,
  Film,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Smile,
  Plane,
  Shield,
  Gift,
  Receipt,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Search,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
} from "lucide-react";

/**
 * Lucide icon map matching category icon strings in data/categories.js
 */
const ICON_MAP = {
  Wallet,
  Laptop,
  TrendingUp,
  Building,
  Home,
  Plus,
  Car,
  Shopping: ShoppingBag,
  ShoppingBag,
  Zap,
  Film,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Smile,
  Plane,
  Shield,
  Gift,
  Receipt,
  MoreHorizontal,
};

/**
 * Clean Production Fintech CategorySidebar.
 */
export function CategorySidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [filterType, setFilterType] = useState("ALL"); // ALL | INCOME | EXPENSE
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleExpand = (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCategories = useMemo(() => {
    return defaultCategories.filter((cat) => {
      const matchesType = filterType === "ALL" || cat.type === filterType;
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subcategories?.some((sub) =>
          sub.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesType && matchesSearch;
    });
  }, [filterType, searchQuery]);

  const incomeCount = defaultCategories.filter((c) => c.type === "INCOME").length;
  const expenseCount = defaultCategories.filter((c) => c.type === "EXPENSE").length;

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-sans">
      {/* 1. Header: Brand Logo & Title */}
      <SidebarHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-xs group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="text-xl font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
              TRAKEX
            </span>
          </Link>
        </div>
      </SidebarHeader>

      {/* 2. Scrollable Content (Clean hidden scrollbars) */}
      <SidebarContent className="p-3 space-y-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* WORKSPACE SECTION */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[11px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-2 mb-1">
            WORKSPACE
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                    <Home className="h-4 w-4 text-zinc-500" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname?.startsWith("/account")}>
                  <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                    <BarChart3 className="h-4 w-4 text-zinc-500" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/transaction/create"}>
                  <Link href="/transaction/create" className="flex items-center gap-3 px-2 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                    <PlusCircle className="h-4 w-4 text-zinc-500" />
                    <span>Add Transaction</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CATEGORIES SECTION */}
        <SidebarGroup className="p-0 pt-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <SidebarGroupLabel className="text-[11px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase p-0">
              CATEGORIES
            </SidebarGroupLabel>
            <Badge variant="outline" className="text-[10px] font-bold border-zinc-300 dark:border-zinc-700">
              {defaultCategories.length}
            </Badge>
          </div>

          {/* Search Box */}
          <div className="px-2 mb-2 relative">
            <Search className="absolute left-4 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus-visible:ring-zinc-400"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="mx-2 mb-2 flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md">
            <button
              onClick={() => setFilterType("ALL")}
              className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${
                filterType === "ALL"
                  ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              All ({defaultCategories.length})
            </button>
            <button
              onClick={() => setFilterType("INCOME")}
              className={`flex-1 py-1 text-[10px] font-bold rounded transition-all flex items-center justify-center gap-0.5 ${
                filterType === "INCOME"
                  ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              Inc ({incomeCount})
            </button>
            <button
              onClick={() => setFilterType("EXPENSE")}
              className={`flex-1 py-1 text-[10px] font-bold rounded transition-all flex items-center justify-center gap-0.5 ${
                filterType === "EXPENSE"
                  ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <ArrowDownRight className="h-3 w-3 text-rose-500" />
              Exp ({expenseCount})
            </button>
          </div>

          {/* Categories Items List */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500">
                  No matching categories
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const IconComponent = ICON_MAP[cat.icon] || Tag;
                  const hasSubcategories = cat.subcategories?.length > 0;
                  const isExpanded = expandedCategories[cat.id];

                  return (
                    <SidebarMenuItem key={cat.id}>
                      <SidebarMenuButton asChild>
                        <div className="flex items-center justify-between group/cat hover:bg-zinc-100 dark:hover:bg-zinc-900 p-2 rounded-md cursor-pointer">
                          <Link
                            href={`/transaction/create?category=${cat.id}`}
                            className="flex items-center gap-2.5 flex-1 min-w-0"
                          >
                            {hasSubcategories ? (
                              <button
                                onClick={(e) => toggleExpand(cat.id, e)}
                                className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                              </button>
                            ) : (
                              <div className="w-3.5" />
                            )}

                            <div
                              className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: cat.color || "#27272a" }}
                            >
                              <IconComponent className="h-3 w-3" />
                            </div>
                            <span className="truncate text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 group-hover/cat:text-zinc-900 dark:group-hover/cat:text-white">
                              {cat.name}
                            </span>
                          </Link>

                          <Settings className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover/cat:opacity-100 transition-opacity" />
                        </div>
                      </SidebarMenuButton>

                      {/* Expandable Subcategories */}
                      {hasSubcategories && isExpanded && (
                        <SidebarMenuSub className="ml-6 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                          {cat.subcategories.map((sub, idx) => (
                            <SidebarMenuSubItem key={idx}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  href={`/transaction/create?category=${cat.id}`}
                                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 py-1"
                                >
                                  • {sub}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer: User Profile & Day/Night Toggle */}
      <SidebarFooter className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "User"}
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.firstName?.charAt(0) || "U"}
              </div>
            )}
            <div className="truncate text-left min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                {user?.fullName || user?.firstName || "Account Owner"}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate leading-tight">
                {user?.primaryEmailAddress?.emailAddress || "user@gmail.com"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <ThemeToggle />
            <SignOutButton>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                <LogOut className="h-4 w-4" />
              </Button>
            </SignOutButton>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default CategorySidebar;
