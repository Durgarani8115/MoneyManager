"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  HelpCircle,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ─── Variant config ────────────────────────────────────────────────────────────
const VARIANT_CONFIG = {
  question: {
    Icon: HelpCircle,
    iconBg: "bg-sky-100 dark:bg-sky-950/60",
    iconColor: "text-sky-600 dark:text-sky-400",
    glow: "shadow-sky-200 dark:shadow-sky-900",
    confirmClass:
      "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white focus-visible:ring-sky-500/30",
  },
  destructive: {
    Icon: Trash2,
    iconBg: "bg-rose-100 dark:bg-rose-950/60",
    iconColor: "text-rose-600 dark:text-rose-400",
    glow: "shadow-rose-200 dark:shadow-rose-900",
    confirmClass:
      "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white focus-visible:ring-rose-500/30",
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: "bg-amber-100 dark:bg-amber-950/60",
    iconColor: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-200 dark:shadow-amber-900",
    confirmClass:
      "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white focus-visible:ring-amber-500/30",
  },
  permission: {
    Icon: ShieldCheck,
    iconBg: "bg-violet-100 dark:bg-violet-950/60",
    iconColor: "text-violet-600 dark:text-violet-400",
    glow: "shadow-violet-200 dark:shadow-violet-900",
    confirmClass:
      "bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white focus-visible:ring-violet-500/30",
  },
  success: {
    Icon: CheckCircle2,
    iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-200 dark:shadow-emerald-900",
    confirmClass:
      "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white focus-visible:ring-emerald-500/30",
  },
};

// ─── ConfirmDialog ─────────────────────────────────────────────────────────────
/**
 * Reusable confirmation dialog.
 *
 * @param {object}  props
 * @param {boolean} props.open              - Controlled open state
 * @param {function} props.onOpenChange     - Radix open-change handler
 * @param {string}  props.title             - Dialog heading
 * @param {string}  [props.description]     - Optional subtext
 * @param {"question"|"destructive"|"warning"|"permission"|"success"} [props.variant="question"]
 * @param {string}  [props.confirmLabel="Confirm"]
 * @param {string}  [props.cancelLabel="Cancel"]
 * @param {function} [props.onConfirm]      - Called when user confirms; can be async
 * @param {function} [props.onCancel]       - Called when user cancels
 * @param {boolean} [props.isLoading]       - External loading override
 * @param {string}  [props.requireTextToConfirm] - User must type this exact string to enable confirm
 * @param {boolean} [props.hideCancelButton] - Hide cancel button (alert/acknowledge mode)
 * @param {React.ReactNode} [props.icon]    - Override default icon
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "question",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading: externalLoading = false,
  requireTextToConfirm,
  hideCancelButton = false,
  icon,
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const mountedRef = useRef(true);

  const isLoading = externalLoading || internalLoading;
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.question;
  const { Icon, iconBg, iconColor, glow, confirmClass } = config;

  // Track mounted state to avoid setState on unmounted component
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset input when dialog opens/closes
  useEffect(() => {
    if (open) {
      setInputValue("");
      setInternalLoading(false);
    }
  }, [open]);

  // Whether the confirm button is enabled
  const confirmEnabled =
    !isLoading &&
    (!requireTextToConfirm || inputValue.trim() === requireTextToConfirm);

  const handleConfirm = async () => {
    if (!confirmEnabled) return;
    if (!onConfirm) {
      onOpenChange(false);
      return;
    }
    try {
      setInternalLoading(true);
      await onConfirm();
      // Only close if still mounted and no external control has closed it
      if (mountedRef.current) {
        onOpenChange(false);
      }
    } catch (err) {
      // Re-throw so callers can handle; dialog stays open
      throw err;
    } finally {
      if (mountedRef.current) {
        setInternalLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (isLoading) return; // block cancel during async op
    onCancel?.();
    onOpenChange(false);
  };

  // Keyboard: Enter to submit, block close during loading
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && confirmEnabled && !requireTextToConfirm) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Block any close attempt while loading
        if (isLoading && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        // Block ESC and outside-click during async operation
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          {/* Icon Badge */}
          <div className="flex flex-col items-center gap-3 pb-1">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
                iconBg,
                glow
              )}
            >
              {icon ?? <Icon className={cn("h-7 w-7", iconColor)} strokeWidth={1.75} />}
            </div>
            <DialogTitle className="text-center text-base font-bold leading-tight text-zinc-900 dark:text-zinc-100">
              {title}
            </DialogTitle>
          </div>

          {description && (
            <DialogDescription className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-0.5 leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Typed-text confirmation field */}
        {requireTextToConfirm && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              Type{" "}
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                {requireTextToConfirm}
              </span>{" "}
              to confirm
            </p>
            <input
              type="text"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && confirmEnabled) {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              disabled={isLoading}
              className={cn(
                "w-full rounded-md border px-3 py-2 text-sm font-mono",
                "bg-background text-foreground",
                "border-zinc-200 dark:border-zinc-800",
                "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-transparent",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors"
              )}
              placeholder={requireTextToConfirm}
              aria-label={`Type ₹{requireTextToConfirm} to confirm`}
            />
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          {!hideCancelButton && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className={cn(
              "flex-1 text-xs font-semibold transition-all",
              confirmClass
            )}
            onClick={handleConfirm}
            disabled={!confirmEnabled}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Processing…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
