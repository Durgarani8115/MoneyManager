"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Pencil, Trash2, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { updateDefaultAccount, deleteAccount } from "@/actions/accounts";
import { EditAccountDrawer } from "@/components/edit-account-drawer";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { loading: setDefaultLoading, fn: setDefaultFn } = useFetch(updateDefaultAccount);
  const { loading: deleteLoading, fn: deleteFn } = useFetch(deleteAccount);

  const handleSetDefault = async () => {
    if (isDefault) {
      toast.info("This account is already the default.");
      return;
    }
    const res = await setDefaultFn(id);
    if (res?.success) {
      toast.success("Default account updated.");
    } else {
      toast.error(res?.error || "Failed to update default.");
    }
  };

  const handleDelete = async () => {
    const res = await deleteFn(id);
    if (res?.success) {
      toast.success("Account deleted successfully.");
      setDeleteConfirm(false);
    } else {
      toast.error(res?.error || "Failed to delete account.");
    }
  };

  return (
    <>
      <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-1 group relative overflow-hidden bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-zinc-100/50 dark:to-zinc-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Link href={`/account/${id}`} className="flex items-center gap-2 flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold capitalize cursor-pointer text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 truncate">
              {name}
            </CardTitle>
            {isDefault && (
              <Badge variant="outline" className="text-[9px] font-extrabold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
                Default
              </Badge>
            )}
          </Link>

          {/* 3-dot Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                disabled={isDefault || setDefaultLoading}
                onClick={handleSetDefault}
              >
                <Star className="h-3.5 w-3.5" />
                {isDefault ? "Already Default" : "Set as Default"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <Link href={`/account/${id}`} className="block">
          <CardContent>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
              ₹{parseFloat(balance).toFixed(2)}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {type.charAt(0) + type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>

          <CardFooter className="flex justify-between pb-4">
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full text-xs font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-full text-xs font-semibold">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Expense</span>
            </div>
          </CardFooter>
        </Link>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConfirm}
          onOpenChange={setDeleteConfirm}
          title={`Delete "${name}"?`}
          description="All transactions linked to this account will also be permanently deleted."
          variant="destructive"
          confirmLabel="Delete Account"
          onConfirm={handleDelete}
          isLoading={deleteLoading}
        />
      </Card>

      {/* Edit Account Drawer */}
      <EditAccountDrawer
        account={account}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

export default AccountCard;
