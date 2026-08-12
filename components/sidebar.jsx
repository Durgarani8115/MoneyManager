"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  CreditCard,
  Receipt,
  BarChart3,
  Camera,
  PlusCircle,
  Tag,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { defaultCategories } from "@/data/categories";

/**
 * Ultra-Sleek Clean Production Fintech Sidebar.
 */
export function CategorySidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-sans">
      {/* 1. Brand Logo Header */}
      <SidebarHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-xs group-hover:scale-105 transition-transform">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase leading-none">
                TRAKEX
              </span>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mt-0.5">
                Fintech Hub
              </span>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      {/* 2. Focused Core Navigation */}
      <SidebarContent className="p-3 space-y-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* MAIN NAVIGATION */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase px-2 mb-1">
            NAVIGATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard" className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-zinc-500" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname?.startsWith("/account")}>
                  <Link href="/dashboard" className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-zinc-500" />
                      <span>Accounts & Cards</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/transaction/create"}>
                  <Link href="/transaction/create" className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-4 w-4 text-zinc-500" />
                      <span>Transactions</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard" className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-zinc-500" />
                      <span>Analytics & Budget</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/transaction/create"}>
                  <Link href="/transaction/create" className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <Camera className="h-4 w-4 text-emerald-500" />
                      <span>AI Receipt Scanner</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-extrabold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50">
                      AI
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* QUICK ACTIONS */}
        <SidebarGroup className="p-0 pt-2">
          <SidebarGroupLabel className="text-[10px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase px-2 mb-1">
            QUICK ACTIONS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/transaction/create" className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold hover:bg-zinc-800 dark:hover:bg-white shadow-xs transition-all">
                    <div className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>New Transaction</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/transaction/create" className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-zinc-500" />
                      <span>Categories</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold border-zinc-300 dark:border-zinc-700">
                      {defaultCategories.length}
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                {user?.fullName || user?.firstName || "Durga Rani"}
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
