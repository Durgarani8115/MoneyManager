"use client";

import { useId } from "react";
import { format } from "date-fns";
import { Loader2, Mic, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
const rateAmount = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumSignificantDigits: 8,
});
const rateDate = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" });

export function TransactionVoiceReview({
  review,
  isStarting,
  isListening,
  isSpeaking,
  isSaving,
  voiceError,
  unrecognizedReply,
  saveError,
  onListen,
  onEdit,
  onReadAloud,
  onStop,
  onSave,
  onCloseAutoFocus,
}) {
  const instructionsId = useId();
  if (!review) return null;

  const { data, accountName, categoryName, conversion } = review;
  const details = [
    ...(conversion ? [
      ["Original amount", `${conversion.currency} ${conversion.originalAmount}`],
      ["Exchange rate", `1 ${conversion.currency} = ${rateAmount.format(conversion.rate)}`],
      ["Rate date", rateDate.format(new Date(conversion.date))],
    ] : []),
    ["Description", data.description?.trim() || "None"],
    ["Type", data.type === "INCOME" ? "Income" : "Expense"],
    ["Account", accountName],
    ["Category", categoryName],
    ["Date", format(data.date, "PPP")],
    ["Recurring", data.isRecurring ? data.recurringInterval.toLowerCase() : "No"],
  ];
  const voiceActive = isStarting || isListening || isSpeaking;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onEdit();
      }}
    >
      <DialogContent
        aria-describedby={instructionsId}
        className="max-h-[90dvh] w-[calc(100%_-_2rem)] overflow-y-auto rounded-xl"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>Review transaction</DialogTitle>
          <p id={instructionsId} className="text-sm text-muted-foreground">
            Say “yes” to save this transaction or “no” to edit it.
          </p>
        </DialogHeader>

        <dl className="min-w-0 overflow-hidden rounded-lg border bg-muted/30 px-4">
          <div className="flex items-baseline justify-between gap-4 border-b py-3">
            <dt className="text-sm font-medium">Amount</dt>
            <dd className="min-w-0 break-words text-right text-xl font-semibold tabular-nums">
              {rupees.format(Number(data.amount))}
            </dd>
          </div>
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-1.5 last:pb-3">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="min-w-0 break-words text-right text-sm">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p role="status" className="text-sm text-muted-foreground">
            {isSaving ? "Saving transaction…"
              : isSpeaking ? "Reading the transaction…"
              : isListening ? "Listening for yes or no…"
              : isStarting ? "Starting microphone…"
              : voiceError || "Microphone paused."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving || isSpeaking}
              onClick={onReadAloud}
            >
              <Volume2 className="h-4 w-4" />
              Read aloud
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={voiceActive && !isSpeaking ? onStop : onListen}
            >
              <Mic className="h-4 w-4" />
              {isSpeaking ? "Skip to reply" : voiceActive ? "Stop voice" : "Listen for reply"}
            </Button>
          </div>
        </div>

        {unrecognizedReply && (
          <p role="status" className="break-words text-sm text-muted-foreground">
            Heard “{unrecognizedReply}”. Say “yes” to save or “no” to edit.
          </p>
        )}
        {saveError && (
          <p role="alert" className="break-words text-sm text-red-600 dark:text-red-400">
            Save failed. {saveError}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" disabled={isSaving} onClick={() => onEdit()}>
            Edit details
          </Button>
          <Button type="button" disabled={isSaving} onClick={onSave}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Saving…" : "Save transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
