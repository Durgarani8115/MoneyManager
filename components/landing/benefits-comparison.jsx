"use client";

import React from "react";
import SpotlightCard from "@/components/ui/react-bits/spotlight-card";
import { CheckCircle2, XCircle, Zap, ShieldCheck, Clock, TrendingUp } from "lucide-react";

export const BenefitsComparison = () => {
  const comparisonItems = [
    {
      feature: "Receipt Entry",
      traditional: "Manual keying of prices & dates line by line",
      moneyManager: "Instant AI scanning in < 3 seconds",
    },
    {
      feature: "Budget Awareness",
      traditional: "Discovered overspending at the end of the month",
      moneyManager: "Real-time automated threshold warnings",
    },
    {
      feature: "Account Syncing",
      traditional: "Scattered spreadsheets across multiple files",
      moneyManager: "Unified multi-account & currency balance hub",
    },
    {
      feature: "Group Expenses",
      traditional: "Awkward manual math & IOUs",
      moneyManager: "Automated friend balances & instant split track",
    },
  ];

  return (
    <section className="py-20 relative bg-zinc-50/60 dark:bg-zinc-900/30 border-y border-zinc-200/80 dark:border-zinc-800">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Why Switch to <span className="text-emerald-500">MoneyManager</span>?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
            Stop wasting hours on manual spreadsheets. Experience automated financial clarity built for modern life.
          </p>
        </div>

        {/* Side-by-side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Traditional Card */}
          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/40 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Traditional Tracking</h3>
                <p className="text-xs text-zinc-500">Manual spreadsheets & paper notes</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-none">
                  <XCircle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.feature}: </span>
                    <span>{item.traditional}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MoneyManager AI Card */}
          <SpotlightCard className="p-8 space-y-6 border-emerald-500/40 dark:border-emerald-500/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">MoneyManager AI</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Automated & Effortless</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                RECOMMENDED
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 last:border-none">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.feature}: </span>
                    <span className="text-zinc-600 dark:text-zinc-300">{item.moneyManager}</span>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

        </div>
      </div>
    </section>
  );
};

export default BenefitsComparison;
