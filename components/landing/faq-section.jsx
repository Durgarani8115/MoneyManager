"use client";

import React, { useState } from "react";
import SpotlightCard from "@/components/ui/react-bits/spotlight-card";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

export const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How does the AI Receipt Scanner work?",
      a: "Our AI Receipt Scanner uses Google Gemini vision technology to read uploaded receipt images, automatically extracting the vendor name, date, total amount, taxes, and assigning the category in seconds.",
    },
    {
      q: "Is MoneyManager free to use?",
      a: "Yes! MoneyManager offers a generous free tier including full account tracking, manual expense logging, budget planning, and basic AI receipt scans. Premium plans unlock unlimited AI scans and advanced analytics.",
    },
    {
      q: "Is my financial data safe and secure?",
      a: "Absolutely. We utilize bank-grade encryption (AES-256) for data storage, secure Clerk authentication, and Arcjet security middleware to protect your transactions and personal privacy.",
    },
    {
      q: "Can I track foreign-currency transactions?",
      a: "Yes. Account balances are shown in rupees (INR). When you enter a supported foreign-currency transaction by voice, MoneyManager converts the amount to rupees using the latest available rate.",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <SpotlightCard
                key={idx}
                className="p-6 cursor-pointer border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/40"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-emerald-500 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isOpen && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </SpotlightCard>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
