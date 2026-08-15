"use client";

import { useState, useEffect } from "react";
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

  const { isListening, transcript, isSupported, startListening, stopListening } =
    useVoiceInput();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
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
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  // Handle Voice Transcript when speech finishes
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      handleParseSpeech(transcript);
    }
  }, [transcript]);

  const handleParseSpeech = async (text) => {
    setVoiceProcessing(true);
    toast.info(`Processing voice: "${text}"`);
    const res = await parseVoiceTransaction(text);
    setVoiceProcessing(false);

    if (res?.success && res.data) {
      const { amount, type: voiceType, description: voiceDesc, category: voiceCat } = res.data;
      if (amount) setValue("amount", amount);
      if (voiceType) setValue("type", voiceType);
      if (voiceDesc) setValue("description", voiceDesc);
      if (voiceCat) setValue("category", voiceCat);
      toast.success("Form filled via Voice!");
    } else {
      toast.error("Could not understand voice command");
    }
  };

  const {
    loading: transactionLoading,
    fn: transactionFn,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    const transactionResult = editMode
      ? await transactionFn(editId, formData)
      : await transactionFn(formData);

    if (!transactionResult?.success) return;

    toast.success(
      editMode
        ? "Transaction updated successfully"
        : "Transaction created successfully"
    );
    reset();
    router.push(`/account/${transactionResult.data.accountId}`);
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
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
  const isRecurring = useWatch({ control, name: "isRecurring" });
  const date = useWatch({ control, name: "date" });
  const accountId = useWatch({ control, name: "accountId" });
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Voice Assistant Header Banner */}
      {!editMode && isSupported && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-full ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-emerald-600 text-white dark:bg-emerald-500"
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {isListening
                  ? "Listening... Speak your transaction now"
                  : voiceProcessing
                  ? "Parsing voice with AI..."
                  : "Voice Assistant"}
              </p>
              <p className="text-[10px] text-zinc-500">
                e.g. "Spent 50 dollars on groceries" or "Received 2000 salary"
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            className={`h-8 text-xs font-semibold ${
              isListening
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
            onClick={isListening ? stopListening : startListening}
            disabled={voiceProcessing}
          >
            {voiceProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isListening ? (
              "Stop Listening"
            ) : (
              "Speak Transaction"
            )}
          </Button>
        </div>
      )}

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
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            value={accountId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (${parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer
                onAccountCreated={(account) =>
                  setValue("accountId", account.id, { shouldValidate: true })
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
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
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
          value={category}
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
          disabled={transactionLoading}
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
