"use client";

import React, { useState } from "react";
import SpotlightCard from "@/components/ui/react-bits/spotlight-card";
import AnimatedGradientText from "@/components/ui/react-bits/animated-gradient-text";
import {
  Receipt,
  Wallet,
  PieChart,
  Users,
  BarChart3,
  Globe,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export const BentoFeatures = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const currencyRates = { USD: "$ 1,250.00", INR: "₹ 1,04,500.00", EUR: "€ 1,150.00", GBP: "£ 980.00" };

  return (
    <section id="features" className="py-24 relative scroll-mt-24">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span> Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Everything You Need to{" "}
            <AnimatedGradientText>Master Money</AnimatedGradientText>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed">
            Built with intelligence, real-time sync, and automated receipt parsing to save you hours every month.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Card 1: AI Smart Receipt Scanner (Span 8) */}
          <SpotlightCard className="lg:col-span-8 p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Receipt className="h-7 w-7" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Powered by Gemini AI
                </span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Instant AI Receipt Scanner
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-xl">
                Snap or upload any paper or digital invoice. MoneyManager automatically extracts store name, total amount, taxes, and categorizes the transaction in seconds.
              </p>
            </div>

            {/* Micro Live Scanner Graphic */}
            <div className="mt-8 relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-5 text-white overflow-hidden shadow-lg">
              {/* Laser Scanner Beam Pass */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-[pulse_2s_infinite] top-1/2 -translate-y-1/2" />

              <div className="flex items-center justify-between text-xs text-zinc-400 pb-3 border-b border-zinc-800">
                <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> RECEIPT_PARSED_SUCCESSFULLY
                </span>
                <span>Just now</span>
              </div>

              <div className="pt-3 space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Apple Store Tech Purchase</span>
                  <span className="text-emerald-400 font-mono font-bold">$1,299.00</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Category: Electronics</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">Tax: $103.92</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Payment: Card (**** 4821)</span>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Multi-Account Hub (Span 4) */}
          <SpotlightCard className="lg:col-span-4 p-8 flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 w-fit mb-6">
                <Wallet className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Multi-Account Aggregation
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Connect and track checking, savings, investment, and credit accounts in one unified dashboard.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Primary HDFC Bank</span>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">₹1,85,400</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">ICICI Credit Card</span>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">₹59,600</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: Intelligent Budgeting (Span 4) */}
          <SpotlightCard className="lg:col-span-4 p-8 flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit mb-6">
                <PieChart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Smart Budgeting & Alerts
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Set monthly limits per category with proactive overspend warnings before you break your budget.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-zinc-600 dark:text-zinc-400">Monthly Budget (68% used)</span>
                <span className="text-emerald-500 font-mono">On Track</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[68%] transition-all duration-500" />
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Friends & Split Expenses (Span 4) */}
          <SpotlightCard className="lg:col-span-4 p-8 flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 w-fit mb-6">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Friends & Split Bills
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Easily split group dinner bills, trip costs, and roommate expenses with automated debt balances.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  RA
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Rahul Sharma</div>
                  <div className="text-[10px] text-zinc-500">Trip to Goa</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-500">+₹1,200</span>
            </div>
          </SpotlightCard>

          {/* Card 5: Multi-Currency Support (Span 4) */}
          <SpotlightCard className="lg:col-span-4 p-8 flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit mb-6">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Multi-Currency Switching
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Track global accounts seamlessly with automatic live currency exchange rate conversions.
              </p>
            </div>

            {/* Interactive Currency Switcher Pill */}
            <div className="mt-6 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                <span>Select Currency</span>
                <span className="font-mono text-emerald-500 font-bold">{currencyRates[selectedCurrency]}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.keys(currencyRates).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setSelectedCurrency(curr)}
                    className={`py-1 text-xs font-mono rounded font-semibold transition-all ${
                      selectedCurrency === curr
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </SpotlightCard>

        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
