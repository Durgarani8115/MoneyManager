import React from "react";
import { getUserTrips } from "@/actions/trips";
import { TripsClient } from "./_components/trips-client";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const res = await getUserTrips();
  const trips = res?.success ? res.data : [];

  return (
    <div className="space-y-6">
      <TripsClient initialTrips={trips} />
    </div>
  );
}
