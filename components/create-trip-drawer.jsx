"use client";

import { useForm } from "react-hook-form";
import { Loader2, Plane, MapPin, DollarSign } from "lucide-react";
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
import { createTrip } from "@/actions/trips";

export function CreateTripDrawer({ open, onOpenChange, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      destination: "",
      budget: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const startDateVal = watch("startDate");
  const endDateVal = watch("endDate");

  const { loading, fn: createFn } = useFetch(createTrip);

  const onSubmit = async (data) => {
    const res = await createFn(data);
    if (res?.success) {
      toast.success("Trip created successfully!");
      onSuccess?.();
      onOpenChange(false);
      reset();
    } else {
      toast.error(res?.error || "Failed to create trip");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-emerald-500" />
            Plan New Trip
          </DrawerTitle>
          <p className="text-xs text-muted-foreground">
            Set a trip budget, track places to visit, and split expenses with friends.
          </p>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Trip Name */}
            <div className="space-y-1.5">
              <label htmlFor="trip-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Trip Name
              </label>
              <Input
                id="trip-name"
                placeholder="e.g. Goa Summer Vacation, Paris Getaway"
                className="text-sm"
                {...register("name", { required: "Trip name is required" })}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label htmlFor="trip-dest" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="trip-dest"
                  placeholder="e.g. Goa, India"
                  className="pl-9 text-sm"
                  {...register("destination", { required: "Destination is required" })}
                />
              </div>
              {errors.destination && (
                <p className="text-xs text-red-500">{errors.destination.message}</p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label htmlFor="trip-budget" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Total Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="trip-budget"
                  type="number"
                  step="0.01"
                  placeholder="1000.00"
                  className="pl-9 text-sm"
                  {...register("budget", { required: "Budget is required" })}
                />
              </div>
              {errors.budget && <p className="text-xs text-red-500">{errors.budget.message}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Start Date
                </label>
                <Input
                  type="date"
                  className="text-xs"
                  value={startDateVal ? format(new Date(startDateVal), "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setValue("startDate", e.target.value ? new Date(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  End Date
                </label>
                <Input
                  type="date"
                  className="text-xs"
                  value={endDateVal ? format(new Date(endDateVal), "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setValue("endDate", e.target.value ? new Date(e.target.value) : undefined)
                  }
                />
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Trip"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateTripDrawer;
