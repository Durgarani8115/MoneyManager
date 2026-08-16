"use client";

import { useState } from "react";
import { Copy, Check, QrCode, ExternalLink, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function UpiDesktopModal({ open, onOpenChange, upiId, name, amount, note }) {
  const [copied, setCopied] = useState(false);

  const numAmount = typeof amount === "number" ? amount : parseFloat(amount || 0);

  const handleCopy = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Pay / PhonePe QR code URL via Google Charts API or QR Server for quick display
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId || "")}&pn=${encodeURIComponent(
    name || "Participant"
  )}&am=${numAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note || "Trip Expense")}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUrl
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-500" />
            Pay via UPI ({name || "Friend"})
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Scan the QR code with any UPI App (GPay, PhonePe, Paytm, BHIM) or copy the VPA details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Amount Badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Requested Amount
              </p>
              <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">
                ₹{numAmount.toFixed(2)}
              </p>
            </div>
            <Badge className="bg-emerald-600 text-white font-bold text-xs">
              UPI Ready
            </Badge>
          </div>

          {/* QR Code display */}
          {upiId ? (
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
              <img
                src={qrImageUrl}
                alt="UPI QR Code"
                className="w-44 h-44 rounded-md border border-zinc-100 dark:border-zinc-800 shadow-xs"
              />
              <p className="text-[11px] text-zinc-500 font-medium text-center flex items-center gap-1">
                <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                Scan using any UPI App
              </p>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg">
              No UPI ID saved for {name}. Please add their UPI ID in Friends list.
            </div>
          )}

          {/* UPI VPA Copy Section */}
          {upiId && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                UPI ID (VPA)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {upiId}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs gap-1.5 shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy ID
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
