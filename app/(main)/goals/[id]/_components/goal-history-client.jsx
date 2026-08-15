"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ChevronRight,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  Target,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { deleteContribution, getGoalDetails } from "@/actions/goals";
import { AddFundsModal } from "@/components/add-funds-modal";

export function GoalHistoryClient({ goal: initialGoal }) {
  const [goal, setGoal] = useState(initialGoal);
  const [addFundsOpen, setAddFundsOpen] = useState(false);

  const { loading: deleteLoading, fn: deleteContribFn } = useFetch(deleteContribution);

  const refreshData = async () => {
    const res = await getGoalDetails(goal.id);
    if (res?.success) {
      setGoal(res.data);
    }
  };

  const handleDeleteContribution = async (contribId) => {
    if (!confirm("Are you sure you want to delete this contribution entry?")) return;
    const res = await deleteContribFn(contribId);
    if (res?.success) {
      toast.success("Entry removed");
      refreshData();
    } else {
      toast.error(res?.error || "Failed to delete entry");
    }
  };

  const actualPercent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const visualPercent = Math.min(100, actualPercent);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/goals" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          Financial Goals
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-900 dark:text-zinc-100 font-medium capitalize">
          {goal.name}
        </span>
      </nav>

      {/* ── Header Card ── */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: goal.color || "#10b981" }}
        />
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {goal.name}
                </h1>
                {goal.status === "COMPLETED" && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-extrabold gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </Badge>
                )}
                {goal.status === "OVERDUE" && (
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-extrabold gap-1">
                    <AlertTriangle className="h-3 w-3" /> Overdue
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Target Date: {goal.targetDate ? format(new Date(goal.targetDate), "PPP") : "None"}
              </p>
            </div>

            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-medium shadow-xs shrink-0"
              onClick={() => setAddFundsOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1 text-emerald-400" />
              Add / Withdraw Funds
            </Button>
          </div>

          {/* Progress Bar & Amount Numbers */}
          <div className="space-y-2 pt-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                  ${goal.currentAmount.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2 font-medium">
                  of ${goal.targetAmount.toFixed(2)} goal
                </span>
              </div>
              <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                {actualPercent.toFixed(1)}%
              </span>
            </div>

            <Progress
              value={visualPercent}
              className="h-3 bg-zinc-100 dark:bg-zinc-800"
              extraStyles={
                goal.status === "COMPLETED"
                  ? "bg-emerald-500"
                  : goal.status === "OVERDUE"
                  ? "bg-rose-500"
                  : "bg-zinc-900 dark:bg-zinc-100"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Auditable Contributions History Table ── */}
      <Card className="border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Contribution History (Audit Log)
          </CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Immutable log of all manual fund additions and withdrawals for this goal.
          </p>
        </CardHeader>
        <CardContent>
          {!goal.contributions || goal.contributions.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500">
              No contributions recorded yet. Click "Add / Withdraw Funds" to get started.
            </div>
          ) : (
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goal.contributions.map((c) => {
                    const isAddition = c.amount >= 0;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs">
                          {format(new Date(c.createdAt), "PP p")}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isAddition
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isAddition ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                            {isAddition ? "Deposit" : "Withdrawal"}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-xs text-right font-bold ${
                            isAddition
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isAddition ? "+" : "-"}${Math.abs(c.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                            onClick={() => handleDeleteContribution(c.id)}
                            disabled={deleteLoading}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Funds Modal */}
      <AddFundsModal
        goal={goal}
        open={addFundsOpen}
        onOpenChange={setAddFundsOpen}
        onSuccess={refreshData}
      />
    </div>
  );
}
