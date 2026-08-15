"use client";

import { useState } from "react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { deleteGoal } from "@/actions/goals";
import { CreateGoalDrawer } from "@/components/create-goal-drawer";
import { AddFundsModal } from "@/components/add-funds-modal";

export function GoalCard({ goal, onRefresh }) {
  const { id, name, targetAmount, currentAmount, targetDate, status, color } = goal;

  const [editOpen, setEditOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { loading: deleteLoading, fn: deleteFn } = useFetch(deleteGoal);

  // Compute percentage (visual capped at 100%, actual text displays real)
  const actualPercent = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const visualPercent = Math.min(100, actualPercent);

  // Days remaining
  const daysLeft = targetDate ? differenceInDays(new Date(targetDate), new Date()) : 0;

  const handleDelete = async () => {
    const res = await deleteFn(id);
    if (res?.success) {
      toast.success("Goal deleted");
      onRefresh?.();
    } else {
      toast.error(res?.error || "Failed to delete goal");
    }
  };

  return (
    <>
      <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md group relative overflow-hidden bg-card">
        {/* Accent Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: color || "#10b981" }}
        />

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CardTitle className="text-base font-extrabold capitalize text-zinc-900 dark:text-zinc-100 truncate">
              {name}
            </CardTitle>

            {/* Status Badge */}
            {status === "COMPLETED" && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[10px] font-extrabold gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Done
              </Badge>
            )}
            {status === "OVERDUE" && (
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800 text-[10px] font-extrabold gap-1">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </Badge>
            )}
            {status === "ACTIVE" && (
              <Badge variant="outline" className="text-[10px] font-bold text-zinc-500 border-zinc-300 dark:border-zinc-700">
                Active
              </Badge>
            )}
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => setAddFundsOpen(true)}
              >
                <PlusCircle className="h-3.5 w-3.5 text-emerald-500" />
                Add / Withdraw
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Numbers */}
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                ${currentAmount.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5 font-medium">
                saved of ${targetAmount.toFixed(2)}
              </span>
            </div>
            <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              {actualPercent.toFixed(0)}%
            </div>
          </div>

          {/* Capped Visual Progress Bar */}
          <div className="space-y-1">
            <Progress
              value={visualPercent}
              className="h-2.5 bg-zinc-100 dark:bg-zinc-800"
              extraStyles={
                status === "COMPLETED"
                  ? "bg-emerald-500"
                  : status === "OVERDUE"
                  ? "bg-rose-500"
                  : "bg-zinc-900 dark:bg-zinc-100"
              }
            />
          </div>

          {/* Footer Info & Target Date */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {targetDate ? format(new Date(targetDate), "PP") : "No date"}
              </span>
            </div>
            <span>
              {daysLeft > 0
                ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                : status === "COMPLETED"
                ? "Achieved!"
                : "Passed target date"}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold"
            onClick={() => setAddFundsOpen(true)}
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1 text-emerald-500" />
            Contribute
          </Button>
          <Link href={`/goals/${id}`} className="flex-1">
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs h-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold"
            >
              History
              <ChevronRight className="h-3.5 w-3.5 ml-1 opacity-60" />
            </Button>
          </Link>
        </CardFooter>

        {/* Delete Confirmation Overlay */}
        {deleteConfirm && (
          <div className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 z-10 rounded-[inherit]">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Delete "{name}"?</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Your actual bank balances will not be affected.
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Drawer */}
      <CreateGoalDrawer
        goal={goal}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onRefresh}
      />

      {/* Add Funds Modal */}
      <AddFundsModal
        goal={goal}
        open={addFundsOpen}
        onOpenChange={setAddFundsOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}

export default GoalCard;
