import React, { Suspense } from "react";
import { getUserGoals } from "@/actions/goals";
import { GoalCard } from "@/components/goal-card";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GoalsPageClient } from "./_components/goals-client";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const result = await getUserGoals();
  const goals = result?.success ? result.data : [];

  return (
    <div className="space-y-6">
      {/* Client wrapper handling state & drawers */}
      <GoalsPageClient initialGoals={goals} />
    </div>
  );
}
