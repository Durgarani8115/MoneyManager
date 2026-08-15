"use client";

import { useMemo } from "react";
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
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SpendingTrends({ transactions = [] }) {
  // Aggregate last 6 months of data
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const mStart = startOfMonth(monthDate);
      const mEnd = endOfMonth(monthDate);
      const label = format(monthDate, "MMM yyyy");

      const monthTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= mStart && d <= mEnd;
      });

      const income = monthTx
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expense = monthTx
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      months.push({
        month: label,
        Income: parseFloat(income.toFixed(2)),
        Expense: parseFloat(expense.toFixed(2)),
        Net: parseFloat((income - expense).toFixed(2)),
      });
    }

    return months;
  }, [transactions]);

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          6-Month Spending & Income Trend
        </CardTitle>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Track cashflow history across the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                formatter={(val) => [`$${val.toFixed(2)}`, undefined]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Income"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Expense"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default SpendingTrends;
