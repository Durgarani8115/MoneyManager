"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export function HeaderTitle() {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    if (!pathname || pathname === "/dashboard") {
      return { section: "Dashboard", page: "Overview" };
    }
    if (pathname.startsWith("/account")) {
      return { section: "Accounts", page: "Account Details" };
    }
    if (pathname === "/transaction/create") {
      return { section: "Transactions", page: "Add Transaction" };
    }
    
    const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] || "Dashboard";
    const titleCase = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    return { section: "Section", page: titleCase };
  };

  const { section, page } = getBreadcrumbs();

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs">
      <span className="font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-[11px]">
        {section}
      </span>
      <ChevronRight className="h-3 w-3 text-zinc-400 shrink-0" />
      <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
        {page}
      </span>
    </div>
  );
}

export default HeaderTitle;
