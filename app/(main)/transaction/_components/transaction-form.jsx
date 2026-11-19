"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Sparkles, Mic, MicOff } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { predictCategory, parseVoiceTransaction } from "@/actions/ai";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { TransactionVoiceReview } from "./transaction-voice-review";

function normalizeVoiceCommand(text) {
  return text.toLowerCase().replace(/[.,!?]/g, " ").trim().replace(/\s+/g, " ");
}

function readConfirmationReply(command) {
  const affirmative = /^(?:yes|yeah|yep)(?: (?:yes|yeah|yep))*(?: please)?(?: (?:save|confirm)(?: (?:it|(?:the |this )?transaction))?)?(?: please)?$/;
  const confirm = /^(?:please )?confirm(?: (?:it|(?:the |this )?transaction))?(?: please)?$/;
  if (affirmative.test(command) || confirm.test(command)) return "yes";
  if (/^no(?: no)*(?: thanks| thank you| please)?$/.test(command)) return "no";
  return null;
}

function isValidVoiceAmount(amount) {
  const value = Number(amount);
  return (
    /^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(amount) &&
    Number.isFinite(value) &&
    value > 0
  );
}

function readBareVoiceAmount(text) {
  const spoken = text.trim().replace(/[.!?]$/, "").trim();
  if (!/^[+-]?[\d,.\s]*\d[\d,.\s]*$/.test(spoken)) return undefined;

  const grouped = /^(?:\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d+)?$/;
  if (spoken.includes(",") && !grouped.test(spoken)) return null;

  const amount = spoken.replaceAll(",", "");
  return isValidVoiceAmount(amount) ? amount : null;
}

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [aiPredicting, setAiPredicting] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);

  const [voiceReview, setVoiceReview] = useState(null);
  const [unrecognizedReply, setUnrecognizedReply] = useState(null);
  const [reviewSaveError, setReviewSaveError] = useState(null);
  const saveStarted = useRef(false);
  const voiceSession = useRef(0);
  const {
    isStarting,
    isListening,
    isSpeaking,
    isSupported,
    error: voiceError,
    lastHeard,
    startListening,
    speak,
    stopVoice,
  } = useVoiceInput();
  const voiceActive = isStarting || isListening || isSpeaking || voiceProcessing;

  useEffect(() => () => {
    voiceSession.current += 1;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    setFocus,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            bankAccountId: initialData.bankAccountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            bankAccountId:
              accounts.find((ac) => ac.isDefault)?.id ??
              (accounts.length === 1 ? accounts[0].id : undefined),
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = async (data, { review, retryByVoice } = {}) => {
    if (saveStarted.current) return;
    saveStarted.current = true;
    stopVoiceSession();
    if (review) {
      setUnrecognizedReply(null);
      setReviewSaveError(null);
    }

    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    let transactionResult;
    let saveError;
    try {
      transactionResult = editMode
        ? await transactionFn(editId, formData)
        : await transactionFn(formData);
    } catch (error) {
      saveError = error?.message;
    }
    if (!transactionResult?.success) {
      saveStarted.current = false;
      if (review) {
        setReviewSaveError(saveError || transactionResult?.error || "Couldn’t save this transaction. Try again.");
        if (retryByVoice) listenForConfirmation(review);
      }
      return;
    }

    setVoiceReview(null);
    toast.success(
      editMode
        ? "Transaction updated successfully"
        : "Transaction created successfully"
    );
    reset();
    router.push(`/account/${transactionResult.data.bankAccountId}`);
  };

  function handleManualSubmit(event) {
    if (voiceReview || voiceProcessing) {
      event.preventDefault();
      return;
    }
    return handleSubmit((data) => onSubmit(data))(event);
  }

  function listenForDraft(retryOnSilence = true) {
    startListening(handleVoiceDraft, {
      onNoSpeech: retryOnSilence ? () => listenForDraft(false) : undefined,
    });
  }

  function stopVoiceSession() {
    voiceSession.current += 1;
    setVoiceProcessing(false);
    stopVoice();
  }

  function closeVoiceReview(resumeListening = false) {
    if (saveStarted.current) return;
    stopVoiceSession();
    setVoiceReview(null);
    if (resumeListening) {
      toast.info("Draft kept. Say the corrected details or “change the amount to” and the new amount.");
      listenForDraft();
    }
  }

  function listenForConfirmation(review, retryOnSilence = true) {
    startListening(
      (text) => {
        const reply = readConfirmationReply(normalizeVoiceCommand(text));
        if (reply === "yes") {
          void onSubmit(review.data, { review, retryByVoice: true });
        } else if (reply === "no") {
          closeVoiceReview(true);
        } else {
          setUnrecognizedReply(text);
          listenForConfirmation(review, retryOnSilence);
        }
      },
      { onNoSpeech: retryOnSilence ? () => listenForConfirmation(review, false) : undefined }
    );
  }

  function readReviewAloud(review) {
    stopVoice();
    const { data, accountName } = review;
    const amount = Number(data.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const type = data.type === "INCOME" ? "Income" : "Expense";
    const description = data.description?.trim();
    const summary = `${type} of ${amount} rupees${description ? ` for ${description}` : ""}. Account ${accountName}.`;
    speak(summary, () => listenForConfirmation(review));
  }

  function reportDraftError(message, resumeListening = true) {
    if (saveStarted.current) return;
    toast.error(message);
    if (resumeListening) listenForDraft();
  }

  function requestVoiceReview(byVoice = false) {
    if (byVoice && getValues("voiceCurrency")?.error) {
      reportDraftError("The exchange rate couldn’t be applied. Say the amount again or enter the INR amount.");
      return;
    }
    stopVoiceSession();
    const session = voiceSession.current;
    void handleSubmit((data) => {
      if (saveStarted.current || voiceSession.current !== session) return;

      const account = accounts.find((item) => item.id === data.bankAccountId);
      const category = categories.find(
        (item) => item.id === data.category && item.type === data.type
      );
      if (!isValidVoiceAmount(data.amount)) {
        const message = "Enter a positive amount with up to two decimal places.";
        setError("amount", { type: "validate", message });
        reportDraftError(message, byVoice);
        return;
      }
      if (!account || !category) {
        const field = account ? "category" : "bankAccountId";
        const message = account ? "Choose a category for this type." : "Choose an account.";
        setError(field, { type: "validate", message });
        reportDraftError(message, byVoice);
        return;
      }

      const voiceCurrency = getValues("voiceCurrency");
      const conversion = voiceCurrency?.amount === data.amount ? voiceCurrency.conversion : null;
      const review = { data, accountName: account.name, categoryName: category.name, conversion };
      setUnrecognizedReply(null);
      setReviewSaveError(null);
      setVoiceReview(review);
      listenForConfirmation(review);
    }, (invalid) => {
      if (voiceSession.current !== session) return;
      const message = invalid.amount ? "Enter or say the transaction amount."
        : invalid.bankAccountId ? "Choose an account."
        : invalid.category ? "Choose a category."
        : "Check the highlighted fields, then say save again.";
      reportDraftError(message, byVoice);
    })();
  }

  async function handleVoiceDraft(text) {
    if (saveStarted.current) return;
    const command = normalizeVoiceCommand(text);
    if (/^(?:please )?(?:save|review|add)(?: (?:it|(?:the |this )?draft|(?:the |this |a )?transaction))?(?: please)?$/.test(command)) {
      requestVoiceReview(true);
      return;
    }
    if (readConfirmationReply(command)) {
      toast.info("Say “save” or “review” to open the confirmation first.");
      listenForDraft();
      return;
    }

    const session = voiceSession.current;
    const bareAmount = readBareVoiceAmount(text);
    if (bareAmount === null) {
      reportDraftError("Say one positive amount with up to two decimal places.");
      return;
    }

    const amountCorrection = text.match(/^(?:change|set)\s+(?:the\s+)?amount\s+to\b[\s,:]+(.+)/i);
    const editedFields = amountCorrection || bareAmount ? ["amount"] : ["amount", "type", "description", "category"];
    const previousValues = getValues(editedFields);

    let result = { success: true, data: { amount: bareAmount, amountOnly: true } };
    if (bareAmount === undefined) {
      setVoiceProcessing(true);
      try {
        result = await parseVoiceTransaction(
          amountCorrection ? `Amount: ${amountCorrection[1]}` : text
        );
      } catch {
        result = null;
      }
    }

    if (voiceSession.current !== session) return;
    setVoiceProcessing(false);
    const amountOnly = Boolean(amountCorrection || result?.data?.amountOnly === true);
    const updatedFields = amountOnly ? ["amount"] : editedFields;
    // Keep edits made while the voice transcript was being parsed.
    if (getValues(updatedFields).some((value, index) => value !== previousValues[index])) {
      toast.info("Your edits were kept. Say save to review the draft.");
      listenForDraft();
      return;
    }
    if (!result?.success) {
      if (result?.code === "CURRENCY_CONVERSION_FAILED") {
        const error = result.error || "The currency couldn’t be converted. Say the amount again or enter the INR amount.";
        setValue("voiceCurrency", { ...getValues("voiceCurrency"), error });
        reportDraftError(error);
      } else if (result?.code === "VOICE_AI_QUOTA" || result?.code === "VOICE_AI_UNAVAILABLE") {
        reportDraftError(result.error);
      } else {
        reportDraftError("The voice service couldn’t process that. Try speaking again.");
      }
      return;
    }

    const parsed = result.data;
    const amount = String(parsed?.amount ?? "").trim();
    if (!isValidVoiceAmount(amount)) {
      reportDraftError("Say a transaction with an amount.");
      return;
    }

    setValue("amount", amount);
    setValue("voiceCurrency", parsed.conversion ? { amount, conversion: parsed.conversion } : null);
    const type = amountOnly ? getValues("type") : parsed.type === "INCOME" ? "INCOME" : "EXPENSE";
    const fallbackCategory = type === "INCOME" ? "other-income" : "other-expense";
    if (!amountOnly) {
      const category = categories.find(
        (item) => item.id === parsed.category && item.type === type
      );
      setValue("type", type);
      setValue("description", typeof parsed.description === "string" ? parsed.description : "");
      setValue("category", category?.id ?? fallbackCategory);
    } else if (!getValues("category")) {
      setValue("category", fallbackCategory);
      clearErrors("category");
    }
    clearErrors(updatedFields);
    toast.success("Draft ready. Say save or review.");
    listenForDraft();
  }

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("voiceCurrency", null);
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  const type = useWatch({ control, name: "type" });
  const voiceCurrency = useWatch({ control, name: "voiceCurrency" });
  const isRecurring = useWatch({ control, name: "isRecurring" });
  const date = useWatch({ control, name: "date" });
  const bankAccountId = useWatch({ control, name: "bankAccountId" });
  const category = useWatch({ control, name: "category" });
  const description = useWatch({ control, name: "description" });
  const recurringInterval = useWatch({ control, name: "recurringInterval" });

  const filteredCategories = categories.filter(
    (categoryItem) => categoryItem.type === type
  );

  const handleAiPredict = async () => {
    if (!description || description.trim().length < 2) {
      toast.error("Please enter a description first");
      return;
    }
    setAiPredicting(true);
    const res = await predictCategory(description);
    setAiPredicting(false);

    if (res?.success && res.category) {
      setValue("category", res.category);
      toast.success(`AI selected category: ${res.categoryName}`);
    } else {
      toast.error("Could not predict category");
    }
  };

  // Show empty state if no accounts exist
  if (accounts.length === 0 && !editMode) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3">
          <svg className="h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Bank Accounts Yet</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">
          You need at least one bank account before you can record a transaction.
        </p>
        <CreateAccountDrawer>
          <button type="button" className="text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-md hover:bg-zinc-800 dark:hover:bg-white transition-colors">
            + Create Your First Account
          </button>
        </CreateAccountDrawer>
      </div>
    );
  }

  return (
    <form onSubmit={handleManualSubmit} className="space-y-6">
      {/* Voice Assistant Header Banner */}
      {!editMode && isSupported && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-3.5 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-zinc-950">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`p-2 rounded-full ${
                voiceActive
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-emerald-600 text-white dark:bg-emerald-500"
              }`}
            >
              {voiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p role="status" className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {isListening
                  ? "Listening for details, “save,” or “review”"
                  : isStarting
                  ? "Starting microphone…"
                  : voiceProcessing
                  ? "Filling in your draft…"
                  : "Voice Assistant"}
              </p>
              <p className="text-[10px] text-zinc-500">
                Say “450” or “Spent 450 on groceries,” then say “save” or “review.” Amounts default to INR.
              </p>
              {lastHeard && (
                <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-300">
                  Heard “{lastHeard}”
                </p>
              )}
              {voiceError && !voiceReview && (
                <p role="status" className="mt-1 text-xs text-rose-700 dark:text-rose-400">
                  {voiceError}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className={`h-8 text-xs font-semibold ${
                voiceActive
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
              onClick={voiceActive ? stopVoiceSession : () => listenForDraft()}
              disabled={transactionLoading}
            >
              {voiceActive ? "Stop Voice" : "Speak Transaction"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => requestVoiceReview()}
              disabled={transactionLoading || voiceProcessing}
            >
              Review draft
            </Button>
          </div>
        </div>
      )}

      <TransactionVoiceReview
        review={voiceReview}
        isStarting={isStarting}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isSaving={transactionLoading}
        voiceError={voiceError}
        unrecognizedReply={unrecognizedReply}
        saveError={reviewSaveError}
        onListen={() => {
          stopVoice();
          listenForConfirmation(voiceReview);
        }}
        onEdit={closeVoiceReview}
        onReadAloud={() => readReviewAloud(voiceReview)}
        onStop={stopVoiceSession}
        onSave={() => onSubmit(voiceReview.data, { review: voiceReview })}
        onCloseAutoFocus={(event) => {
          if (saveStarted.current) return;
          event.preventDefault();
          setFocus("description");
        }}
      />

      {/* Receipt Scanner - Only show in create mode */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          value={type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (₹)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { onChange: () => setValue("voiceCurrency", null) })}
          />
          {voiceCurrency?.conversion && (
            <p className="text-sm text-muted-foreground">
              Converted from {voiceCurrency.conversion.currency} {voiceCurrency.conversion.originalAmount}.
            </p>
          )}
          {voiceCurrency?.error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {voiceCurrency.error} Your draft is unchanged.
            </p>
          )}
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) => setValue("bankAccountId", value)}
            value={bankAccountId ?? ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer
                onAccountCreated={(account) =>
                  setValue("bankAccountId", account.id, { shouldValidate: true })
                }
              >
                <Button
                  variant="ghost"
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.bankAccountId && (
            <p className="text-sm text-red-500">{errors.bankAccountId.message}</p>
          )}
        </div>
      </div>

      {/* Description & AI Predict Trigger */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Description</label>
          {type === "EXPENSE" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-semibold gap-1"
              onClick={handleAiPredict}
              disabled={aiPredicting}
            >
              <Sparkles className={`h-3 w-3 ${aiPredicting ? "animate-spin" : ""}`} />
              {aiPredicting ? "Predicting..." : "Auto-Categorize with AI"}
            </Button>
          )}
        </div>
        <Input placeholder="e.g. Starbucks Coffee, Grocery Run" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          value={category ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Recurring Transaction</label>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            value={recurringInterval}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 w-full max-w-full overflow-hidden">
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-w-[100px] truncate"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={transactionLoading || voiceProcessing}
          className="flex-[2] min-w-[150px] truncate"
        >
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}
