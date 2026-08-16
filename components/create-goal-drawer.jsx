"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Target, Calendar } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { createGoal, updateGoal } from "@/actions/goals";
import { goalSchema, editGoalSchema } from "@/app/lib/schema";

const COLOR_OPTIONS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
];

export function CreateGoalDrawer({ goal, open, onOpenChange, onSuccess }) {
  const isEditing = !!goal;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(isEditing ? editGoalSchema : goalSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      targetDate: undefined,
      color: "#10b981",
    },
  });

  const selectedColor = watch("color");
  const targetDateValue = watch("targetDate");

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
        color: goal.color || "#10b981",
      });
    } else {
      reset({
        name: "",
        targetAmount: "",
        targetDate: undefined,
        color: "#10b981",
      });
    }
  }, [goal, reset, open]);

  const { loading: createLoading, fn: createFn } = useFetch(createGoal);
  const { loading: updateLoading, fn: updateFn } = useFetch(updateGoal);
  const isLoading = createLoading || updateLoading;

  const onSubmit = async (data) => {
    const action = isEditing ? updateFn(goal.id, data) : createFn(data);
    const result = await action;

    if (result?.success) {
      toast.success(isEditing ? "Goal updated!" : "Goal created successfully!");
      onSuccess?.();
      onOpenChange(false);
      reset();
    } else {
      toast.error(result?.error || "Failed to save goal");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEditing ? "Edit Savings Goal" : "Create Savings Goal"}</DrawerTitle>
          <p className="text-xs text-muted-foreground">
            Goals are virtual targets to help you save. They do not deduct from your bank accounts.
          </p>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Goal Name */}
            <div className="space-y-1.5">
              <label htmlFor="goal-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Goal Name
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="goal-name"
                  placeholder="e.g. New Laptop, Emergency Fund"
                  className="pl-9 text-sm"
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Target Amount */}
            <div className="space-y-1.5">
              <label htmlFor="goal-amount" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Target Amount (₹)
              </label>
              <Input
                id="goal-amount"
                type="number"
                step="0.01"
                placeholder="5000.00"
                className="text-sm"
                {...register("targetAmount")}
              />
              {errors.targetAmount && (
                <p className="text-xs text-red-500">{errors.targetAmount.message}</p>
              )}
            </div>

            {/* Target Date */}
            <div className="space-y-1.5">
              <label htmlFor="goal-date" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Target Date
              </label>
              <Input
                id="goal-date"
                type="date"
                className="text-sm"
                value={
                  targetDateValue
                    ? format(new Date(targetDateValue), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  setValue("targetDate", e.target.value ? new Date(e.target.value) : undefined)
                }
              />
              {errors.targetDate && (
                <p className="text-xs text-red-500">{errors.targetDate.message}</p>
              )}
            </div>

            {/* Color Accent Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Color Theme
              </label>
              <div className="flex items-center gap-3 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-7 h-7 rounded-full transition-all ₹{
                      selectedColor === c
                        ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setValue("color", c)}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Goal"
                ) : (
                  "Create Goal"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateGoalDrawer;
