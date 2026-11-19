"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function SpendingTrends({ chartData, periodLabel, controls }) {
  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Spending & Income Trend
          </CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {periodLabel} to date
          </p>
        </div>
        {controls && <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">{controls}</div>}
      </CardHeader>
      <CardContent>
        {chartData.length ? (
          <div className="h-[280px] min-w-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={currency.format} />
                <Tooltip
                  formatter={(value) => currency.format(value)}
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={chartData.length <= 12 ? { r: 4 } : false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Expense"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={chartData.length <= 12 ? { r: 4 } : false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">
            No transactions in this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SpendingTrends;
