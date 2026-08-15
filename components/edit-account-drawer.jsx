"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wallet } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateAccount } from "@/actions/accounts";
import { editAccountSchema } from "@/app/lib/schema";

export function EditAccountDrawer({ account, open, onOpenChange, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(editAccountSchema),
    defaultValues: {
      name: account?.name || "",
      type: account?.type || "CURRENT",
      isDefault: account?.isDefault || false,
    },
  });

  // Reset form values when the account prop changes (e.g., different card clicked)
  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        type: account.type,
        isDefault: account.isDefault,
      });
    }
  }, [account, reset]);

  const { loading: updateLoading, fn: updateFn } = useFetch(updateAccount);

  const onSubmit = async (data) => {
    const result = await updateFn(account.id, data);
    if (result?.success) {
      toast.success("Account updated successfully");
      onSuccess?.();
      onOpenChange(false);
    } else {
      toast.error(result?.error || "Failed to update account");
    }
  };

  const accountType = useWatch({ control, name: "type" });
  const isDefault = useWatch({ control, name: "isDefault" });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Account</DrawerTitle>
          <p className="text-xs text-muted-foreground">
            Balance cannot be edited directly. Use transactions to adjust your balance.
          </p>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Name */}
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium leading-none">
                Account Name
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-name"
                  placeholder="e.g., Main Checking"
                  className="pl-9"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <label htmlFor="edit-type" className="text-sm font-medium leading-none">
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                value={accountType}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Set as Default */}
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 shadow-sm">
              <div className="space-y-1">
                <label
                  htmlFor="edit-isDefault"
                  className="text-sm font-semibold cursor-pointer text-zinc-900 dark:text-zinc-100"
                >
                  Set as Default
                </label>
                <p className="text-xs text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="edit-isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default EditAccountDrawer;
