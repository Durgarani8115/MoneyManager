"use client";

import { useState, useEffect } from "react";
import { Loader2, PlusCircle, MinusCircle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addContribution } from "@/actions/goals";

export function AddFundsModal({ goal, open, onOpenChange, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  // Generate a fresh Idempotency Key UUID on mount / dialog open
  useEffect(() => {
    if (open) {
      setIdempotencyKey(crypto.randomUUID());
      setAmount("");
      setIsWithdraw(false);
    }
  }, [open]);

  const { loading, fn: submitFn } = useFetch(addContribution);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const finalAmount = isWithdraw ? -val : val;
    const res = await submitFn(goal.id, {
      amount: finalAmount,
      idempotencyKey,
    });

    if (res?.success) {
      toast.success(
        isWithdraw
          ? `Withdrew $${val.toFixed(2)} from goal!`
          : `Added $${val.toFixed(2)} to goal!`
      );
      onSuccess?.();
      onOpenChange(false);
    } else {
      toast.error(res?.error || "Failed to update goal funds");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isWithdraw ? "Withdraw Funds" : "Add Funds to Goal"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Goal: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{goal?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Toggle Add / Withdraw */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-900">
            <button
              type="button"
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                !isWithdraw
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              onClick={() => setIsWithdraw(false)}
            >
              <PlusCircle className="h-3.5 w-3.5 text-emerald-500" />
              Add Funds
            </button>
            <button
              type="button"
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                isWithdraw
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              onClick={() => setIsWithdraw(true)}
            >
              <MinusCircle className="h-3.5 w-3.5 text-rose-500" />
              Withdraw
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fund-amount" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Amount ($)
            </label>
            <Input
              id="fund-amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            {isWithdraw && (
              <p className="text-[11px] text-zinc-500">
                Max available: ${goal?.currentAmount?.toFixed(2) || "0.00"}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className={`flex-1 text-xs font-semibold text-white ${
                isWithdraw
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Processing...
                </>
              ) : isWithdraw ? (
                "Withdraw"
              ) : (
                "Add Funds"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddFundsModal;
