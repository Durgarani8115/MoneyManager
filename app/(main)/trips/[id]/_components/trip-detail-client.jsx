"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  toggleSplitSettled,
} from "@/actions/trips";
import { getUserFriends } from "@/actions/friends";
import { UpiPayButton } from "@/components/upi-pay-button";
import { useConfirm } from "@/hooks/use-confirm";

export function TripDetailClient({ trip: initialTrip }) {
  const [trip, setTrip] = useState(initialTrip);
  const [friends, setFriends] = useState([]);
  const confirm = useConfirm();

  // Modals state
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [placeCost, setPlaceCost] = useState("");

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("Me");

  // Split state
  const [enableSplit, setEnableSplit] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]); // array of friend IDs (plus "me")

  // Expanded expense IDs state
  const [expandedExpenseIds, setExpandedExpenseIds] = useState([]);

  // AI Plan state
  const [aiPlan, setAiPlan] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const { fn: addPlaceFn, loading: addPlaceLoading } = useFetch(addTripPlace);
  const { fn: addExpFn, loading: addExpLoading } = useFetch(addTripExpense);
  const { fn: deletePlaceFn } = useFetch(deleteTripPlace);
  const { fn: deleteExpFn } = useFetch(deleteTripExpense);
  const { fn: toggleVisitedFn } = useFetch(togglePlaceVisited);
  const { fn: toggleSettledFn } = useFetch(toggleSplitSettled);

  const loadFriends = async () => {
    const res = await getUserFriends();
    if (res?.success) {
      setFriends(res.data);
      // default select "me" and all friends when opening split
      setSelectedFriendIds(["me", ...res.data.map((f) => f.id)]);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

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
  const handleDeletePlace = async (place) => {
    const ok = await confirm({
      title: `Delete "${place.name}"?`,
      description: "Are you sure you want to remove this place from your itinerary checklist?",
      variant: "destructive",
      confirmLabel: "Remove Place",
    });
    if (!ok) return;

    const res = await deletePlaceFn(place.id);
    if (res?.success === false) {
      toast.error(res?.error || "Failed to remove place");
    } else {
      toast.success("Place removed from checklist");
      refreshTrip();
    }
  };

  // Add Split Expense Handler
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter valid expense details");
      return;
    }

    let participantsData = [];

    if (enableSplit) {
      if (selectedFriendIds.length === 0) {
        toast.error("Please select at least 1 participant to split with");
        return;
      }

      participantsData = selectedFriendIds.map((id) => {
        if (id === "me") {
          return { friendId: "me", friendName: "Me", friendUpiId: null };
        }
        const found = friends.find((f) => f.id === id);
        return {
          friendId: found?.id || id,
          friendName: found?.name || "Friend",
          friendUpiId: found?.upiId || null,
        };
      });
    }

    const res = await addExpFn(trip.id, {
      title: expTitle,
      amount: amountNum,
      paidBy: expPaidBy || "Me",
      splitType: enableSplit ? "EQUAL" : "NONE",
      participants: participantsData,
    });

    if (res?.success) {
      toast.success(enableSplit ? "Expense split recorded!" : "Expense recorded!");
      setExpTitle("");
      setExpAmount("");
      setExpPaidBy("Me");
      setEnableSplit(false);
      setExpenseModalOpen(false);
      refreshTrip();
    } else {
      toast.error(res?.error || "Failed to add expense");
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (exp) => {
    const hasUnsettled = exp.splits && exp.splits.some((s) => !s.settled);
    const description = hasUnsettled
      ? "This expense has pending unsettled splits with friends. Deleting it will permanently remove these split records."
      : "Are you sure you want to delete this trip expense? This action cannot be undone.";

    const ok = await confirm({
      title: `Delete "${exp.title}"?`,
      description,
      variant: "destructive",
      confirmLabel: "Delete Expense",
    });

    if (!ok) return;

    const res = await deleteExpFn(exp.id);
    if (res?.success === false) {
      toast.error(res?.error || "Failed to delete expense");
    } else {
      toast.success("Expense deleted successfully");
      refreshTrip();
    }
  };

  // Toggle Split Settled
  const handleToggleSettled = async (splitId) => {
    const res = await toggleSettledFn(splitId);
    if (res?.success) {
      toast.success(res.data.settled ? "Marked as Settled!" : "Marked as Unsettled");
      refreshTrip();
    } else {
      toast.error(res?.error || "Failed to update settlement state");
    }
  };

  // Bulk Settle All for a Friend
  const handleSettleAllForFriend = async (unsettledSplits) => {
    for (const s of unsettledSplits) {
      await toggleSettledFn(s.id);
    }
    toast.success("Splits marked as settled!");
    refreshTrip();
  };

  // Toggle Expanded Expense Card
  const toggleExpand = (expId) => {
    setExpandedExpenseIds((prev) =>
      prev.includes(expId) ? prev.filter((id) => id !== expId) : [...prev, expId]
    );
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

  // Calculate split expenses summary
  const paidBySummary = trip.expenses.reduce((acc, exp) => {
    const person = exp.paidBy || "Me";
    acc[person] = (acc[person] || 0) + exp.amount;
    return acc;
  }, {});

  // Net Balance Summary (Who Owes You What)
  const friendBalanceMap = {};
  trip.expenses.forEach((exp) => {
    if (exp.splits && exp.splits.length > 0) {
      exp.splits.forEach((split) => {
        if (split.friendName !== "Me") {
          const key = split.friendId ? `id:${split.friendId}` : `name:${split.friendName}`;
          if (!friendBalanceMap[key]) {
            friendBalanceMap[key] = {
              id: key,
              name: split.friendName,
              upiId: split.friendUpiId,
              totalOwed: 0,
              totalSettled: 0,
              unsettledSplits: [],
            };
          }
          if (!friendBalanceMap[key].upiId && split.friendUpiId) {
            friendBalanceMap[key].upiId = split.friendUpiId;
          }

          if (split.settled) {
            friendBalanceMap[key].totalSettled += split.amount;
          } else {
            friendBalanceMap[key].totalOwed += split.amount;
            friendBalanceMap[key].unsettledSplits.push(split);
          }
        }
      });
    }
  });

  const percentSpent = trip.budget > 0 ? (trip.totalSpent / trip.budget) * 100 : 0;
  const isOverBudget = percentSpent >= 100;

  // Toggle participant checkbox in split form
  const toggleParticipant = (id) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentAmountFloat = parseFloat(expAmount || "0");
  const numParticipants = selectedFriendIds.length;
  const perPersonShare =
    numParticipants > 0 && !isNaN(currentAmountFloat) && currentAmountFloat > 0
      ? (currentAmountFloat / numParticipants).toFixed(2)
      : "0.00";

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
              <Sparkles className={`h-3.5 w-3.5 ₹{aiLoading ? "animate-spin" : ""}`} />
              {aiLoading ? "AI Planning..." : "Generate AI Trip Plan"}
            </Button>
          </div>

          {/* Budget Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-baseline justify-between text-xs">
              <div>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                  ₹{trip.totalSpent.toFixed(2)}
                </span>
                <span className="text-zinc-500 ml-1.5 font-medium">
                  spent of ₹{trip.budget.toFixed(2)} budget
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
                ⚠️ You are <strong>₹{(trip.totalSpent - trip.budget).toFixed(2)}</strong> over your planned budget!
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

      {/* ── Net Balance & UPI Settlement Summary ── */}
      {Object.keys(friendBalanceMap).length > 0 && (
        <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Group Split Net Balances & UPI Settlement
              </span>
              <Link href="/friends" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                Manage Friends <ChevronRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(friendBalanceMap).map((friendItem) => (
                <div
                  key={friendItem.id}
                  className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {friendItem.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {friendItem.upiId || "No UPI ID"}
                      </p>
                    </div>

                    {friendItem.totalOwed > 0 ? (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] font-bold">
                        Owes ₹{friendItem.totalOwed.toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px] font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Fully Settled
                      </Badge>
                    )}
                  </div>

                  {friendItem.totalOwed > 0 && (
                    <div className="pt-1 flex items-center gap-2">
                      <UpiPayButton
                        upiId={friendItem.upiId}
                        name={friendItem.name}
                        amount={friendItem.totalOwed}
                        note={`Trip split settlement (${trip.name})`}
                        className="flex-1"
                      />

                      {friendItem.unsettledSplits.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-[11px] border-zinc-300 dark:border-zinc-700"
                          onClick={() => handleSettleAllForFriend(friendItem.unsettledSplits)}
                        >
                          Mark Settled
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                      className={`truncate ₹{
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
                        Est. ₹{place.estimatedCost.toFixed(2)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-400 hover:text-rose-600"
                      onClick={() => handleDeletePlace(place)}
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
                Trip Expenses & Group Splits
              </CardTitle>
              <p className="text-xs text-zinc-500">
                Track shared costs and individual shares
              </p>
            </div>
            <Button
              size="sm"
              className="h-7 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              onClick={() => {
                loadFriends();
                setExpenseModalOpen(true);
              }}
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
                      {person}: ₹{total.toFixed(2)}
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
              <div className="space-y-2.5">
                {trip.expenses.map((exp) => {
                  const hasSplits = exp.splits && exp.splits.length > 0;
                  const isExpanded = expandedExpenseIds.includes(exp.id);
                  const settledCount = hasSplits
                    ? exp.splits.filter((s) => s.settled).length
                    : 0;

                  return (
                    <div
                      key={exp.id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all"
                    >
                      <div className="flex items-center justify-between p-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {exp.title}
                            </p>
                            {hasSplits && (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200">
                                {settledCount}/{exp.splits.length} Settled
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            Paid by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{exp.paidBy || "Me"}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                            -₹{exp.amount.toFixed(2)}
                          </span>

                          {hasSplits && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-400 hover:text-zinc-700"
                              onClick={() => toggleExpand(exp.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-zinc-400 hover:text-rose-600"
                            onClick={() => handleDeleteExpense(exp)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Split Entries Expanded Details */}
                      {hasSplits && isExpanded && (
                        <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40 p-3 space-y-2">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            Equal Split Breakdown
                          </p>
                          <div className="space-y-1.5">
                            {exp.splits.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {s.friendName}
                                  </span>
                                  <span className="text-zinc-500 font-bold">
                                    ₹{s.amount.toFixed(2)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {s.friendName !== "Me" && !s.settled && (
                                    <UpiPayButton
                                      upiId={s.friendUpiId}
                                      name={s.friendName}
                                      amount={s.amount}
                                      note={`Split for ₹{exp.title}`}
                                      size="xs"
                                    />
                                  )}

                                  {s.friendName !== "Me" && (
                                    <Button
                                      size="xs"
                                      variant={s.settled ? "outline" : "default"}
                                      className={`h-6 text-[10px] ₹{
                                        s.settled
                                          ? "text-emerald-600 border-emerald-300 dark:border-emerald-800"
                                          : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                      }`}
                                      onClick={() => handleToggleSettled(s.id)}
                                    >
                                      {s.settled ? "✓ Settled" : "Mark Settled"}
                                    </Button>
                                  )}

                                  {s.friendName === "Me" && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      Your Share
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

      {/* Add Expense & Split Dialog */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Log Trip Expense</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record a new trip expense and optionally split it equally with friends.
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
                Total Amount ($ / ₹)
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

            {/* Split Equal Checkbox Toggle */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable-split"
                    checked={enableSplit}
                    onCheckedChange={(checked) => {
                      setEnableSplit(!!checked);
                      if (checked && selectedFriendIds.length === 0) {
                        setSelectedFriendIds(["me", ...friends.map((f) => f.id)]);
                      }
                    }}
                  />
                  <label
                    htmlFor="enable-split"
                    className="text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    Split this expense equally
                  </label>
                </div>

                <Link
                  href="/friends"
                  target="_blank"
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <UserPlus className="h-3 w-3" /> Manage Friends
                </Link>
              </div>

              {enableSplit && (
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>Select Participants:</span>
                    {numParticipants > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ₹{perPersonShare} / person ({numParticipants})
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {/* Always include 'Me' */}
                    <div
                      className="flex items-center space-x-2 p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      onClick={() => toggleParticipant("me")}
                    >
                      <Checkbox
                        id="part-me"
                        checked={selectedFriendIds.includes("me")}
                        onCheckedChange={() => toggleParticipant("me")}
                      />
                      <label htmlFor="part-me" className="text-xs font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer flex-1">
                        Me (You)
                      </label>
                    </div>

                    {friends.length === 0 ? (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 italic pt-1">
                        No friends added yet. Click &quot;Manage Friends&quot; above to add contacts with UPI IDs.
                      </p>
                    ) : (
                      friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center space-x-2 p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          onClick={() => toggleParticipant(friend.id)}
                        >
                          <Checkbox
                            id={`part-₹{friend.id}`}
                            checked={selectedFriendIds.includes(friend.id)}
                            onCheckedChange={() => toggleParticipant(friend.id)}
                          />
                          <label
                            htmlFor={`part-₹{friend.id}`}
                            className="text-xs font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer flex-1 flex items-center justify-between"
                          >
                            <span>{friend.name}</span>
                            {friend.upiId && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {friend.upiId}
                              </span>
                            )}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
