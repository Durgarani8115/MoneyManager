"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CreateAccountDrawer } from "@/components/create-account-drawer";

export function AccountSwitcher({ accounts = [] }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-200 shadow-xs"
          >
            <Wallet className="h-4 w-4 sm:mr-2 text-zinc-500" />
            <span className="hidden sm:inline font-medium text-xs">Switch Account</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
            Your Accounts
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {accounts.length === 0 && (
            <div className="p-2 text-xs text-center text-muted-foreground">
              No accounts found
            </div>
          )}

          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              asChild
            >
              <Link href={`/account/${account.id}`} className="cursor-pointer w-full">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">
                    {account.name}
                    {account.isDefault && (
                      <span className="ml-2 text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm">
                        Default
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase">
                    {account.type}
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 focus:bg-zinc-100 dark:focus:bg-zinc-900"
            onClick={(e) => {
              e.preventDefault(); // Prevent dropdown from closing and losing focus
              setDrawerOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateAccountDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAccountCreated={() => setDrawerOpen(false)}
      />
    </>
  );
}
