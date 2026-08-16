"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardAIInsights } from "@/actions/ai";

export function AiInsightsCard() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    const res = await getDashboardAIInsights();
    if (res?.success && res.data) {
      setInsights(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <Card className="border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/40 via-white to-zinc-50 dark:from-emerald-950/20 dark:via-zinc-950 dark:to-zinc-900/40 shadow-xs relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white dark:bg-emerald-500 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Trakex AI Insights
            </CardTitle>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Personalized financial advice powered by Gemini AI
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          onClick={fetchInsights}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-500" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2 py-2">
            <div className="h-4 bg-zinc-200/60 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-zinc-200/60 dark:bg-zinc-800 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-zinc-200/60 dark:bg-zinc-800 rounded animate-pulse w-2/3" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <Lightbulb className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="leading-snug">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AiInsightsCard;
