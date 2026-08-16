"use client";

import React, { useState } from "react";
import SpotlightCard from "@/components/ui/react-bits/spotlight-card";
import { Receipt, PieChart, Users, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const InteractiveDemoTabs = () => {
  const [activeTab, setActiveTab] = useState("scanner");

  return (
    <section className="py-20 bg-zinc-50/80 dark:bg-zinc-900/40 border-y border-zinc-200/80 dark:border-zinc-800">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Playground</span>
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Try MoneyManager in Action
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Experience our core features right now without creating an account.
          </p>
        </div>

        {/* Tab Selector Pills */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "scanner"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40"
            }`}
          >
            <Receipt className="h-4 w-4 text-emerald-500" />
            <span>AI Receipt Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab("budget")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "budget"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40"
            }`}
          >
            <PieChart className="h-4 w-4 text-emerald-500" />
            <span>Budget Alert Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("friends")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "friends"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40"
            }`}
          >
            <Users className="h-4 w-4 text-emerald-500" />
            <span>Split Expense Hub</span>
          </button>
        </div>

        {/* Tab Content Preview */}
        <SpotlightCard className="p-8 border-emerald-500/30">
          {activeTab === "scanner" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Gemini AI Receipt Parsing</h3>
                  <p className="text-xs text-zinc-500">Automated OCR & Intelligent Field Extraction</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                  Status: Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-500">Merchant Recognized</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">Whole Foods Market</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-500">Total Amount</div>
                  <div className="font-mono font-bold text-emerald-500 text-lg">$84.50</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-500">Category Assigned</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">Groceries & Food</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Monthly Budget Protection</h3>
                  <p className="text-xs text-zinc-500">Proactive overspend warning simulation</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                  Health: 82% Safe
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-zinc-700 dark:text-zinc-300">Dining Out Budget ($400 limit)</span>
                    <span className="text-emerald-500 font-mono font-bold">$290.00 spent</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[72.5%]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>AI Insight: You are on track to save $110 in dining out this month!</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "friends" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Group Bill Settlement</h3>
                  <p className="text-xs text-zinc-500">Equal & custom split tracking between friends</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                  3 Friends Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Alex owes you</span>
                  <span className="text-emerald-500 font-mono font-bold text-sm">+₹850</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">You owe Priya</span>
                  <span className="text-zinc-500 font-mono font-bold text-sm">-₹420</span>
                </div>
              </div>
            </div>
          )}
        </SpotlightCard>
      </div>
    </section>
  );
};

export default InteractiveDemoTabs;
