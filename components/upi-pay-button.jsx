"use client";

import { useState, useEffect } from "react";
import { Smartphone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { buildUpiLink, isMobileDevice } from "@/lib/upi";
import { UpiDesktopModal } from "@/components/upi-desktop-modal";
import { toast } from "sonner";

export function UpiPayButton({
  upiId,
  name = "Friend",
  amount,
  note = "Expense Split",
  size = "sm",
  variant = "default",
  className = "",
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const upiLink = buildUpiLink({ upiId, name, amount, note });

  const handleClick = (e) => {
    if (!upiId) {
      e.preventDefault();
      toast.error(`No UPI ID saved for ${name}. Add their UPI ID in Friends page.`);
      return;
    }

    if (!isMobile) {
      e.preventDefault();
      setModalOpen(true);
    }
  };

  if (!upiId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                size={size}
                variant="outline"
                disabled
                className={`text-xs opacity-60 cursor-not-allowed ${className}`}
              >
                <Smartphone className="h-3.5 w-3.5 mr-1" />
                Pay via UPI
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            No UPI ID provided for {name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      {isMobile ? (
        <a href={upiLink} onClick={handleClick}>
          <Button
            size={size}
            variant={variant}
            className={`text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs gap-1 ${className}`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Pay via UPI
            <ExternalLink className="h-3 w-3 opacity-70 ml-0.5" />
          </Button>
        </a>
      ) : (
        <Button
          size={size}
          variant={variant}
          onClick={handleClick}
          className={`text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs gap-1.5 ${className}`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          Pay via UPI
        </Button>
      )}

      <UpiDesktopModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        upiId={upiId}
        name={name}
        amount={amount}
        note={note}
      />
    </>
  );
}
