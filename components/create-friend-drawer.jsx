"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, UserPlus, Smartphone, Phone } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { createFriend, updateFriend } from "@/actions/friends";

export function CreateFriendDrawer({ open, onOpenChange, onSuccess, initialData = null }) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      upiId: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name || "");
      setValue("upiId", initialData.upiId || "");
      setValue("phone", initialData.phone || "");
    } else {
      reset({ name: "", upiId: "", phone: "" });
    }
  }, [initialData, open, setValue, reset]);

  const { loading: createLoading, fn: createFn } = useFetch(createFriend);
  const { loading: updateLoading, fn: updateFn } = useFetch(updateFriend);

  const loading = createLoading || updateLoading;

  const onSubmit = async (data) => {
    let res;
    if (isEditing) {
      res = await updateFn(initialData.id, data);
    } else {
      res = await createFn(data);
    }

    if (res?.success) {
      toast.success(isEditing ? "Friend contact updated!" : "Friend added successfully!");
      onSuccess?.();
      onOpenChange(false);
      reset();
    } else {
      toast.error(res?.error || "Failed to save friend contact");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-500" />
            {isEditing ? "Edit Friend Contact" : "Add New Friend"}
          </DrawerTitle>
          <p className="text-xs text-muted-foreground">
            Save contact details and UPI ID for easy group expense splitting and direct UPI payments.
          </p>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Friend Name */}
            <div className="space-y-1.5">
              <label htmlFor="friend-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Friend Name *
              </label>
              <Input
                id="friend-name"
                placeholder="e.g. Rahul Sharma, Sarah Jenkins"
                className="text-sm"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* UPI ID (VPA) */}
            <div className="space-y-1.5">
              <label htmlFor="friend-upi" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                UPI ID (Optional, for direct payments)
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="friend-upi"
                  placeholder="e.g. rahul@okaxis, 9876543210@paytm"
                  className="pl-9 text-sm font-mono"
                  {...register("upiId", {
                    pattern: {
                      value: /^[\w.\-]+@[\w]+₹/,
                      message: "Invalid UPI ID format (e.g. username@upi)",
                    },
                  })}
                />
              </div>
              {errors.upiId ? (
                <p className="text-xs text-red-500">{errors.upiId.message}</p>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Required if you want to click &quot;Pay via UPI&quot; directly to this friend.
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="friend-phone" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="friend-phone"
                  placeholder="+91 98765 43210"
                  className="pl-9 text-sm"
                  {...register("phone")}
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
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Contact"
                ) : (
                  "Add Friend"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
