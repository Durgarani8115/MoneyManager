"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Users,
  Sparkles,
  AlertTriangle,
  Loader2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import {
  getTripDetails,
  addTripPlace,
  togglePlaceVisited,
  deleteTripPlace,
  addTripExpense,
  deleteTripExpense,
  generateAiTripPlan,
} from "@/actions/trips";

export function TripDetailClient({ trip: initialTrip }) {
  const [trip, setTrip] = useState(initialTrip);

  // Modals state
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [placeCost, setPlaceCost] = useState("");

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("Me");

  // AI Plan state
  const [aiPlan, setAiPlan] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const { fn: addPlaceFn, loading: addPlaceLoading } = useFetch(addTripPlace);
  const { fn: addExpFn, loading: addExpLoading } = useFetch(addTripExpense);
  const { fn: deletePlaceFn } = useFetch(deleteTripPlace);
  const { fn: deleteExpFn } = useFetch(deleteTripExpense);
  const { fn: toggleVisitedFn } = useFetch(togglePlaceVisited);

  const refreshTrip = async () => {
    const res = await getTripDetails(trip.id);
    if (res?.success) {
      setTrip(res.data);
    }
  };

  // Add Place Handler
  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!placeName.trim()) return;

    const res = await addPlaceFn(trip.id, {
      name: placeName,
      estimatedCost: parseFloat(placeCost || 0),
    });

    if (res?.success) {
      toast.success("Place added to checklist!");
      setPlaceName("");
      setPlaceCost("");
      setPlaceModalOpen(false);
      refreshTrip();
    } else {
      toast.error(res?.error || "Failed to add place");
    }
  };

  // Toggle Visited
  const handleToggleVisited = async (placeId) => {
    await toggleVisitedFn(placeId);
    refreshTrip();
  };

  // Delete Place
  const handleDeletePlace = async (placeId) => {
    await deletePlaceFn(placeId);
    refreshTrip();
  };

  // Add Split Expense Handler
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter valid expense details");
      return;
    }

    const res = await addExpFn(trip.id, {
      title: expTitle,
      amount: amountNum,
      paidBy: expPaidBy || "Me",
    });

    if (res?.success) {
      toast.success("Expense recorded!");
      setExpTitle("");
      setExpAmount("");
      setExpPaidBy("Me");
      setExpenseModalOpen(false);
      refreshTrip();
    } else {
      toast.error(res?.error || "Failed to add expense");
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (expId) => {
    await deleteExpFn(expId);
    refreshTrip();
  };

  // AI Trip Assistant
  const handleGenerateAiPlan = async () => {
    setAiLoading(true);
    const res = await generateAiTripPlan(trip.id);
    setAiLoading(false);
    if (res?.success && res.plan) {
      setAiPlan(res.plan);
      toast.success("AI Trip Plan generated!");
    } else {
      toast.error(res?.error || "Failed to generate AI plan");
    }
  };

  // Calculate split expenses per person
  const paidBySummary = trip.expenses.reduce((acc, exp) => {
    const person = exp.paidBy || "Me";
    acc[person] = (acc[person] || 0) + exp.amount;
    return acc;
  }, {});

  const percentSpent = trip.budget > 0 ? (trip.totalSpent / trip.budget) * 100 : 0;
  const isOverBudget = percentSpent >= 100;

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/trips" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          Trips & Vacation Planner
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          {trip.name}
        </span>
      </nav>

      {/* ── Trip Header Card ── */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {trip.name}
                </h1>
                {isOverBudget && (
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-extrabold gap-1">
                    <AlertTriangle className="h-3 w-3" /> Budget Exceeded
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                {trip.destination}
              </p>
            </div>

            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs gap-1.5 shrink-0"
              onClick={handleGenerateAiPlan}
              disabled={aiLoading}
            >
              <Sparkles className={`h-3.5 w-3.5 ${aiLoading ? "animate-spin" : ""}`} />
              {aiLoading ? "AI Planning..." : "Generate AI Trip Plan"}
            </Button>
          </div>

          {/* Budget Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-baseline justify-between text-xs">
              <div>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                  ${trip.totalSpent.toFixed(2)}
                </span>
                <span className="text-zinc-500 ml-1.5 font-medium">
                  spent of ${trip.budget.toFixed(2)} budget
                </span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {percentSpent.toFixed(0)}%
              </span>
            </div>

            <Progress
              value={Math.min(100, percentSpent)}
              className="h-2.5 bg-zinc-100 dark:bg-zinc-800"
              extraStyles={isOverBudget ? "bg-rose-500" : "bg-emerald-500"}
            />
          </div>

          {/* Over-budget suggestion notice */}
          {isOverBudget && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-700 dark:text-rose-400">
              <span>
                ⚠️ You are <strong>${(trip.totalSpent - trip.budget).toFixed(2)}</strong> over your planned budget!
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] border-rose-300 dark:border-rose-800 hover:bg-rose-100 text-rose-800 dark:text-rose-300"
                onClick={handleGenerateAiPlan}
              >
                Ask AI to Optimize Budget
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── AI Generated Trip Itinerary Section ── */}
      {aiPlan && (
        <Card className="border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/30 via-white to-zinc-50 dark:from-emerald-950/20 dark:via-zinc-950 dark:to-zinc-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Trakex AI Trip Plan & Advice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-200">
            {aiPlan}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── 1. Places to Visit Checklist ── */}
        <Card className="border-zinc-200/80 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Places to Visit Checklist
              </CardTitle>
              <p className="text-xs text-zinc-500">
                {trip.places.filter((p) => p.visited).length} of {trip.places.length} visited
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-zinc-200 dark:border-zinc-800"
              onClick={() => setPlaceModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Place
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {trip.places.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                No places added to checklist yet.
              </div>
            ) : (
              trip.places.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <button
                    type="button"
                    className="flex items-center gap-2.5 text-xs text-left font-medium min-w-0 flex-1"
                    onClick={() => handleToggleVisited(place.id)}
                  >
                    {place.visited ? (
                      <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-400 shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        place.visited
                          ? "line-through text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {place.name}
                    </span>
                  </button>

                  <div className="flex items-center gap-3 shrink-0">
                    {place.estimatedCost > 0 && (
                      <span className="text-xs font-semibold text-zinc-500">
                        Est. ${place.estimatedCost.toFixed(2)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-400 hover:text-rose-600"
                      onClick={() => handleDeletePlace(place.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* ── 2. Split Expenses Log & Paid-By Summary ── */}
        <Card className="border-zinc-200/80 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-500" />
                Trip Expenses & Splits
              </CardTitle>
              <p className="text-xs text-zinc-500">
                Track who paid for what on this trip
              </p>
            </div>
            <Button
              size="sm"
              className="h-7 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              onClick={() => setExpenseModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Expense
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Paid-By Summary Pills */}
            {Object.keys(paidBySummary).length > 0 && (
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Total Paid Per Person
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(paidBySummary).map(([person, total]) => (
                    <Badge
                      key={person}
                      variant="outline"
                      className="text-xs bg-white dark:bg-zinc-800 font-semibold border-zinc-300 dark:border-zinc-700"
                    >
                      {person}: ${total.toFixed(2)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses List */}
            {trip.expenses.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-400">
                No expenses logged for this trip yet.
              </div>
            ) : (
              <div className="space-y-2">
                {trip.expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-900"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {exp.title}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Paid by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{exp.paidBy || "Me"}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                        -${exp.amount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-400 hover:text-rose-600"
                        onClick={() => handleDeleteExpense(exp.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Place Dialog */}
      <Dialog open={placeModalOpen} onOpenChange={setPlaceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Place to Visit</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new destination or landmark to your trip checklist.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPlace} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Place Name
              </label>
              <Input
                placeholder="e.g. Baga Beach, Eiffel Tower"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Estimated Cost ($) (Optional)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="20.00"
                value={placeCost}
                onChange={(e) => setPlaceCost(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setPlaceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" disabled={addPlaceLoading}>
                Add Place
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Log Trip Expense</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record a new shared expense and specify who paid.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Expense Title
              </label>
              <Input
                placeholder="e.g. Hotel Stay, Dinner, Cab"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Amount ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="150.00"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Who Paid?
              </label>
              <Input
                placeholder="e.g. Me, Rahul, Sarah"
                value={expPaidBy}
                onChange={(e) => setExpPaidBy(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setExpenseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" disabled={addExpLoading}>
                Save Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
