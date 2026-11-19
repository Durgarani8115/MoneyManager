"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle, AlertCircle, CheckCircle2, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultCategories } from "@/data/categories";
import { setCategoryBudget, deleteCategoryBudget } from "@/actions/budget";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

const expenseCategories = defaultCategories.filter((c) => c.type === "EXPENSE");

export function CategoryBudgets({ initialBudgets = [] }) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(expenseCategories[0]?.id || "food");
  const [limitAmount, setLimitAmount] = useState("");

  const { loading: saveLoading, fn: saveFn } = useFetch(setCategoryBudget);
  const { loading: deleteLoading, fn: deleteFn } = useFetch(deleteCategoryBudget);

  const handleOpenDialog = (catId = "", currentLimit = "") => {
    setSelectedCategory(catId || expenseCategories[0]?.id || "food");
    setLimitAmount(currentLimit ? currentLimit.toString() : "");
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const amount = parseFloat(limitAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const res = await saveFn(selectedCategory, amount);
    if (res?.success) {
      toast.success("Category budget set!");
      // Update local state
      setBudgets((prev) => {
        const existingIdx = prev.findIndex((b) => b.category === selectedCategory);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], limit: amount };
          return updated;
        }
        return [...prev, { category: selectedCategory, limit: amount, spent: 0 }];
      });
      setDialogOpen(false);
    } else {
      toast.error(res?.error || "Failed to set budget");
    }
  };

  const handleDelete = async (category) => {
    const res = await deleteFn(category);
    if (res?.success) {
      toast.success("Budget limit removed");
      setBudgets((prev) => prev.filter((b) => b.category !== category));
    } else {
      toast.error(res?.error || "Failed to remove budget");
    }
  };

  return (
    <>
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Category Budgets (Monthly Limits)
            </CardTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Set spending limits per category to prevent overspending
            </p>
          </div>
          <Button
            size="sm"
            className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Set Limit
          </Button>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Tag className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm font-medium">No category limits set.</p>
              <p className="text-xs text-zinc-400 max-w-xs mt-1 mb-3">
                Set monthly spending caps for Food, Shopping, Transport, and more.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleOpenDialog()}
              >
                Set First Limit
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {budgets.map((b) => {
                const catObj = expenseCategories.find((c) => c.id === b.category);
                const catName = catObj?.name || b.category;
                const percent = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
                const isExceeded = percent >= 100;
                const isWarning = percent >= 80 && percent < 100;

                return (
                  <div
                    key={b.category}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm capitalize text-zinc-900 dark:text-zinc-100">
                          {catName}
                        </span>
                        {isExceeded && (
                          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-extrabold gap-1">
                            <AlertCircle className="h-3 w-3" /> Exceeded
                          </Badge>
                        )}
                        {isWarning && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] font-extrabold gap-1">
                            <AlertTriangle className="h-3 w-3" /> 80%+ Used
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          onClick={() => handleOpenDialog(b.category, b.limit)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-400 hover:text-rose-600"
                          onClick={() => handleDelete(b.category)}
                          disabled={deleteLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                        ₹{b.spent.toFixed(2)} / ₹{b.limit.toFixed(2)}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {percent.toFixed(0)}%
                      </span>
                    </div>

                    <Progress
                      value={Math.min(100, percent)}
                      className="h-2 bg-zinc-200 dark:bg-zinc-800"
                      extraStyles={
                        isExceeded
                          ? "bg-rose-500"
                          : isWarning
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Category Budget Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Set Category Spending Limit
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a monthly budget limit for this category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Select Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Monthly Limit Amount (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="300.00"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                disabled={saveLoading}
              >
                {saveLoading ? "Saving..." : "Save Limit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CategoryBudgets;
