"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plane, Plus, MapPin, Calendar, ChevronRight, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CreateTripDrawer } from "@/components/create-trip-drawer";
import { getUserTrips, deleteTrip } from "@/actions/trips";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

export function TripsClient({ initialTrips = [] }) {
  const [trips, setTrips] = useState(initialTrips);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const confirm = useConfirm();

  const refreshTrips = async () => {
    const res = await getUserTrips();
    if (res?.success) {
      setTrips(res.data);
    }
  };

  const handleDeleteTrip = async (e, tripId) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete Trip?",
      description: "This will permanently delete the trip and all its expenses.",
      variant: "destructive",
      confirmLabel: "Delete Trip",
    });
    if (!ok) return;

    const res = await deleteTrip(tripId);
    if (res?.success) {
      toast.success("Trip deleted");
      refreshTrips();
    } else {
      toast.error(res?.error || "Failed to delete trip");
    }
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title flex items-center gap-2">
            <Plane className="h-6 w-6 text-emerald-500" />
            AI Trip Planner & Splits
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Plan vacations, track places to visit, split expenses with friends, and get AI budget advice.
          </p>
        </div>

        <Button
          size="sm"
          className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-medium shadow-xs"
          onClick={() => setDrawerOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Trip
        </Button>
      </div>

      {/* ── Trips Grid ── */}
      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-3">
            <Plane className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Trips Planned Yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">
            Create a trip to organize your budget, check off places to visit, and split expenses with friends.
          </p>
          <Button
            size="sm"
            className="text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            onClick={() => setDrawerOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Plan Your First Trip
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => {
            const percent = trip.budget > 0 ? (trip.totalSpent / trip.budget) * 100 : 0;
            const isOverBudget = percent >= 100;

            return (
              <Card
                key={trip.id}
                className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md group relative overflow-hidden bg-card"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                        {trip.name}
                      </CardTitle>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{trip.destination}</span>
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-400 hover:text-rose-600 shrink-0"
                      onClick={(e) => handleDeleteTrip(e, trip.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <Link href={`/trips/${trip.id}`} className="block">
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                          ₹{trip.totalSpent.toFixed(2)}
                        </span>
                        <span className="text-xs text-zinc-500 ml-1 font-medium">
                          spent of ₹{trip.budget.toFixed(2)}
                        </span>
                      </div>
                      {isOverBudget ? (
                        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-bold">
                          Exceeded
                        </Badge>
                      ) : (
                        <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                          {percent.toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <Progress
                      value={Math.min(100, percent)}
                      className="h-2 bg-zinc-100 dark:bg-zinc-800"
                      extraStyles={isOverBudget ? "bg-rose-500" : "bg-emerald-500"}
                    />

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                      <span>{trip.places.length} places to visit</span>
                      <span>{trip.expenses.length} split expenses</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      Open Trip Dashboard
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </CardFooter>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Trip Drawer */}
      <CreateTripDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSuccess={refreshTrips}
      />
    </>
  );
}
