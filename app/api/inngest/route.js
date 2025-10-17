import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
} from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processRecurringTransaction,
    triggerRecurringTransactions,
    generateMonthlyReports,
    checkBudgetAlerts,
  ],
});
























// import { serve } from "inngest/next";
// import { NextResponse } from "next/server";
// import { inngest } from "@/lib/inngest/client";
// import { helloWorld } from "@/lib/inngest/functions";

// let handlers;
// try {
//   const rawHandlers = serve({
//     client: inngest,
//     functions: [helloWorld],
//   });

//   handlers = {
//     GET: async (req, ...rest) => {
//       try {
//         return await rawHandlers.GET(req, ...rest);
//       } catch (e) {
//         console.error("Inngest request handler error (GET):", e);
//         return NextResponse.json({ success: false, error: String(e.message || e), stack: e.stack }, { status: 500 });
//       }
//     },
//     POST: async (req, ...rest) => {
//       try {
//         return await rawHandlers.POST(req, ...rest);
//       } catch (e) {
//         console.error("Inngest request handler error (POST):", e);
//         return NextResponse.json({ success: false, error: String(e.message || e), stack: e.stack }, { status: 500 });
//       }
//     },
//     PUT: async (req, ...rest) => {
//       try {
//         return await rawHandlers.PUT(req, ...rest);
//       } catch (e) {
//         console.error("Inngest request handler error (PUT):", e);
//         return NextResponse.json({ success: false, error: String(e.message || e), stack: e.stack }, { status: 500 });
//       }
//     },
//   };
// } catch (err) {
//   console.error("Inngest initialization error:", err);
//   const errorJson = (e) => NextResponse.json({ success: false, error: String(e?.message || e), stack: e?.stack }, { status: 500 });
//   handlers = {
//     GET: () => errorJson(err),
//     POST: () => errorJson(err),
//     PUT: () => errorJson(err),
//   };
// }

// export const { GET, POST, PUT } = handlers;
