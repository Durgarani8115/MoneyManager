import React from "react";
import { getTripDetails } from "@/actions/trips";
import { notFound } from "next/navigation";
import { TripDetailClient } from "./_components/trip-detail-client";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({ params }) {
  const { id } = await params;
  const res = await getTripDetails(id);

  if (!res?.success || !res.data) {
    notFound();
  }

  return <TripDetailClient trip={res.data} />;
}
