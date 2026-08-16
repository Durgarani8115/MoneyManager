"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
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
  BarChart3,
  PlusCircle,
  ChevronRight,
  LogOut,
  ArrowLeftRight,
  Target,
  Plane,
  Users,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    isActive: (p) => p === "/dashboard",
  },
  {
    label: "Accounts & Cards",
    href: "/accounts",
    icon: CreditCard,
    isActive: (p) =>
      p?.startsWith("/accounts") || p?.startsWith("/account/"),
  },
  {
    label: "AI Trip Planner",
    href: "/trips",
    icon: Plane,
    isActive: (p) => p?.startsWith("/trips") || p?.startsWith("/trip/"),
  },
  {
    label: "Friends & Splits",
    href: "/friends",
    icon: Users,
    isActive: (p) => p?.startsWith("/friends"),
  },
  {
    label: "Financial Goals",
    href: "/goals",
    icon: Target,
    isActive: (p) => p?.startsWith("/goals") || p?.startsWith("/goal/"),
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    isActive: (p) =>
      p?.startsWith("/transactions") || p?.startsWith("/transaction"),
  },
  {
    label: "Analytics & Budget",
    href: "/analytics",
    icon: BarChart3,
    isActive: (p) => p === "/analytics",
  },
];

export function CategorySidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-sans"
    >
      {/* ── Brand Header ── */}
      <SidebarHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-xs group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase leading-none">
              TRAKEX
            </span>
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mt-0.5">
              Fintech Hub
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="p-3 space-y-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase px-2 mb-1.5">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map(({ label, href, icon: Icon, isActive }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive(pathname)}>
                    <Link
                      href={href}
                      className="flex items-center justify-between px-2.5 py-2 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
                        <span>{label}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Quick Actions ── */}
        <SidebarGroup className="p-0 pt-2">
          <SidebarGroupLabel className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase px-2 mb-1.5">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/transaction/create"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold hover:bg-zinc-800 dark:hover:bg-white shadow-xs transition-all text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>New Transaction</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: User Profile ── */}
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
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user?.firstName?.charAt(0) || "U"}
              </div>
            )}
            <div className="truncate text-left min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                {user?.fullName || user?.firstName || "User"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate leading-tight">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <ThemeToggle />
            <SignOutButton>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
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
