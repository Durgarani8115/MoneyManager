"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Target, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { GoalCard } from "@/components/goal-card";
import { CreateGoalDrawer } from "@/components/create-goal-drawer";
import { getUserGoals } from "@/actions/goals";

export function GoalsPageClient({ initialGoals }) {
  const [goals, setGoals] = useState(initialGoals || []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshGoals = async () => {
    const res = await getUserGoals();
    if (res?.success) {
      setGoals(res.data);
    }
  };

  // Summary counts
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const activeGoals = goals.filter((g) => g.status === "ACTIVE").length;
  const overdueGoals = goals.filter((g) => g.status === "OVERDUE").length;

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title">
            Financial Goals
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track your virtual savings targets — emergency funds, large purchases, or vacations.
          </p>
        </div>

        <Button
          size="sm"
          className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-medium shadow-xs"
          onClick={() => setDrawerOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Goal
        </Button>
      </div>

      {/* ── Summary Cards Bar ── */}
      {totalGoals > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Goals</p>
            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{totalGoals}</p>
          </div>
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Active</p>
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{activeGoals}</p>
          </div>
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Completed</p>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{completedGoals}</p>
          </div>
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Overdue</p>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{overdueGoals}</p>
          </div>
        </div>
      )}

      {/* ── Goals Grid ── */}
      {totalGoals === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-3">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Savings Goals Yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">
            Set up virtual goals to stay motivated — save for a car, emergency fund, or next trip.
          </p>
          <Button
            size="sm"
            className="text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            onClick={() => setDrawerOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onRefresh={refreshGoals} />
          ))}
        </div>
      )}

      {/* Create Drawer */}
      <CreateGoalDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSuccess={refreshGoals}
      />
    </>
  );
}
