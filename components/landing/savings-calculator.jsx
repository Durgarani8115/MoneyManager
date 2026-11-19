"use client";

import React, { useState } from "react";
import SpotlightCard from "@/components/ui/react-bits/spotlight-card";
import { Calculator, Clock, IndianRupee, Sparkles } from "lucide-react";

export const SavingsCalculator = () => {
  const [monthlySpend, setMonthlySpend] = useState(50000);

  // Calculations:
  // Estimated 8% saved annually via overspend alerts & category optimization
  const annualSavings = Math.round((monthlySpend * 12) * 0.08);
  // Estimated 4.5 hours saved monthly on receipt typing = 54 hours per year
  const hoursSaved = Math.round((monthlySpend / 10000) * 12 + 36);

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <SpotlightCard className="p-8 md:p-12 border-emerald-500/30">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-200/80 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">
                <Calculator className="h-4 w-4" />
                <span>Interactive ROI Calculator</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                Calculate Your Annual Savings
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                See how much money and time MoneyManager AI can save you every year.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-center font-mono font-bold text-sm">
              ✨ 8% Average Expense Optimization
            </div>
          </div>

          {/* Controls & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 items-center">
            
            {/* Left: Interactive Slider */}
            <div className="md:col-span-7 space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Estimated Monthly Expenses
                </label>
                <span className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                  ₹{monthlySpend.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min="10000"
                max="250000"
                step="5000"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="flex justify-between text-xs text-zinc-500 font-mono">
                <span>₹10,000</span>
                <span>₹1,25,000</span>
                <span>₹2,50,000+</span>
              </div>
            </div>

            {/* Right: Calculated Metrics */}
            <div className="md:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 text-white dark:bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span>Money Saved</span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  ₹{annualSavings.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-400">per year</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 text-white dark:bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Time Saved</span>
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {hoursSaved} hrs
                </div>
                <div className="text-[10px] text-zinc-400">manual typing</div>
              </div>
            </div>

          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};

export default SavingsCalculator;
