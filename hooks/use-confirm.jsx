"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

// ─── Context ────────────────────────────────────────────────────────────────────
const ConfirmContext = createContext(null);

// ─── Default dialog state ───────────────────────────────────────────────────────
const DEFAULT_STATE = {
  open: false,
  title: "",
  description: undefined,
  variant: "question",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  requireTextToConfirm: undefined,
  hideCancelButton: false,
  icon: undefined,
};

// ─── Provider ───────────────────────────────────────────────────────────────────
/**
 * Wrap your app (or a subtree) with ConfirmProvider to enable useConfirm().
 * Place it inside ThemeProvider so dark-mode CSS vars are available.
 */
export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState(DEFAULT_STATE);

  // Holds the resolve function for the current pending promise.
  // Using a ref avoids stale closure issues.
  const resolveRef = useRef(null);

  /**
   * Imperatively open a confirmation dialog.
   * Returns a promise that resolves to:
   *   - `true`  if user clicked Confirm
   *   - `false` if user cancelled or dismissed
   */
  const openConfirm = useCallback((options) => {
    // If there's already a pending confirm, resolve it as false (queue policy)
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialogState({
        ...DEFAULT_STATE,
        ...options,
        open: true,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleOpenChange = useCallback((isOpen) => {
    if (!isOpen) {
      // Dismissed via ESC or outside click
      resolveRef.current?.(false);
      resolveRef.current = null;
      setDialogState((prev) => ({ ...prev, open: false }));
    }
  }, []);

  return (
    <ConfirmContext.Provider value={openConfirm}>
      {children}
      <ConfirmDialog
        open={dialogState.open}
        onOpenChange={handleOpenChange}
        title={dialogState.title}
        description={dialogState.description}
        variant={dialogState.variant}
        confirmLabel={dialogState.confirmLabel}
        cancelLabel={dialogState.cancelLabel}
        requireTextToConfirm={dialogState.requireTextToConfirm}
        hideCancelButton={dialogState.hideCancelButton}
        icon={dialogState.icon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────────
/**
 * Imperative confirmation hook.
 *
 * @example
 * const confirm = useConfirm();
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: "Delete Trip?",
 *     description: "This will permanently delete the trip and all expenses.",
 *     variant: "destructive",
 *     confirmLabel: "Delete",
 *   });
 *   if (!ok) return;
 *   // ... proceed with delete
 * };
 *
 * @returns {(options: ConfirmOptions) => Promise<boolean>}
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "[useConfirm] must be used inside <ConfirmProvider>. " +
        "Wrap your app layout with <ConfirmProvider>."
    );
  }
  return ctx;
}

export default useConfirm;
