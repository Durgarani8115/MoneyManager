import React from "react";
import Link from "next/link";
import { getUserGoals } from "@/actions/goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight, Plus } from "lucide-react";
import CreateGoalDrawer from "@/components/create-goal-drawer";

export async function GoalsSummary() {
  const res = await getUserGoals();
  const goals = res?.success ? res.data : [];

  // Show top 3 active or incomplete goals
  const activeGoals = goals.slice(0, 3);

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" />
            Savings Goals
          </CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Your progress towards key financial targets
          </p>
        </div>
        <Link href="/goals">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold"
          >
            View All
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Target className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs">No active savings goals.</p>
            <Link href="/goals" className="mt-2">
              <Button variant="outline" size="sm" className="text-xs h-7">
                Create a Goal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const actualPercent =
                goal.targetAmount > 0
                  ? (goal.currentAmount / goal.targetAmount) * 100
                  : 0;
              const visualPercent = Math.min(100, actualPercent);

              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {goal.name}
                    </span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                      ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)} ({actualPercent.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress
                    value={visualPercent}
                    className="h-2 bg-zinc-100 dark:bg-zinc-800"
                    extraStyles={
                      goal.status === "COMPLETED"
                        ? "bg-emerald-500"
                        : goal.status === "OVERDUE"
                        ? "bg-rose-500"
                        : "bg-zinc-900 dark:bg-zinc-100"
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
