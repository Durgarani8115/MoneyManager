import React from "react";
import { getGoalDetails } from "@/actions/goals";
import { notFound } from "next/navigation";
import { GoalHistoryClient } from "./_components/goal-history-client";

export const dynamic = "force-dynamic";

export default async function GoalDetailsPage({ params }) {
  const { id } = await params;
  const result = await getGoalDetails(id);

  if (!result?.success || !result.data) {
    notFound();
  }

  return <GoalHistoryClient goal={result.data} />;
}
