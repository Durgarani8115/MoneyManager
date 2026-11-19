# 💸 Trakex (Money Manager) — Deep Technical Architecture & Code Implementation Guide

Welcome to the comprehensive technical documentation for **Trakex**. This document explains **how every single feature works under the hood behind the code**, including the underlying concepts, algorithms, NPM packages/libraries used, and exact step-by-step code execution logic.

---

## 📑 Table of Contents
1. [Executive Summary](#-executive-summary)
2. [Feature 1: UPI Deep Link & Dynamic QR Code Payment Settlement](#-feature-1-upi-deep-link--dynamic-qr-code-payment-settlement)
3. [Feature 2: Integer Paise-Math Group Expense Splitting Algorithm](#-feature-2-integer-paise-math-group-expense-splitting-algorithm)
4. [Feature 3: Web Speech API & AI Voice-to-Transaction Parser](#-feature-3-web-speech-api--ai-voice-to-transaction-parser)
5. [Feature 4: Context-Aware AI Financial Advisor & Insights Engine](#-feature-4-context-aware-ai-financial-advisor--insights-engine)
6. [Feature 5: Automated Recurring Transactions & Inngest Queue Processing](#-feature-5-automated-recurring-transactions--inngest-queue-processing)
7. [Feature 6: Background Budget Monitoring & Transactional Email Engine](#-feature-6-background-budget-monitoring--transactional-email-engine)
8. [Feature 7: Savings Goals & Idempotent Contribution Engine](#-feature-7-savings-goals--idempotent-contribution-engine)
9. [Feature 8: Security, Rate Limiting & Token Bucket Enforcement](#-feature-8-security-rate-limiting--token-bucket-enforcement)
10. [Summary Table of Packages & Concepts](#-summary-table-of-packages--concepts)

---

## 🎯 Executive Summary

Trakex is built with **Next.js 16 App Router**, **Prisma ORM 7**, **PostgreSQL**, **Google Gemini 2.5 Flash**, **Inngest**, **Resend**, and **Arcjet**. Below is the precise engineering blueprint explaining how each feature is actually executed in code.

---

## 📲 Feature 1: UPI Deep Link & Dynamic QR Code Payment Settlement

### 💡 Concept & Protocol
* **Standard**: NPCI Unified Payments Interface (UPI) Deep Link URI Specification (`upi://pay`).
* **URI Parameter Format**:
  ```text
  upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<NOTE>
  ```
  * `pa` (*Payee Address*): The recipient's VPA / UPI ID (e.g., `user@upi` or `9876543210@paytm`).
  * `pn` (*Payee Name*): Display name of payee.
  * `am` (*Amount*): Number formatted strictly to 2 decimal places (e.g., `250.00`).
  * `cu` (*Currency*): Set to `INR`.
  * `tn` (*Transaction Note*): Brief note describing the split.

### 🛠️ Packages & Libraries Used
* `lib/upi.js`: Custom helper logic.
* `components/upi-pay-button.jsx` & `components/upi-desktop-modal.jsx`: UI modal rendered with `@radix-ui/react-dialog`.
* `api.qrserver.com`: External QR encoding API (converts URI string into vector/png QR code image).

### ⚙️ Code Implementation & Execution Flow
1. **URI Construction** ([upi.js](file:///d:/Project/MoneyManager/MoneyManager/lib/upi.js)):
   ```javascript
   export function buildUpiLink({ upiId, name, amount, note }) {
     const numAmount = typeof amount === "number" ? amount : parseFloat(amount || 0);
     const params = new URLSearchParams({
       pa: upiId.trim(),
       pn: name ? name.trim() : "Participant",
       am: numAmount.toFixed(2),
       cu: "INR",
       tn: note ? note.trim() : "Trip expense split",
     });
     return `upi://pay?${params.toString()}`;
   }
   ```
2. **Device Detection (Mobile vs Desktop Routing)**:
   * **Mobile**: UserAgent regex check (`/Android|iPhone|iPad/i`). Clicking *"Pay via UPI"* renders `<a href="upi://pay?...">`. When tapped on mobile, Android/iOS OS intercepts the custom protocol scheme (`upi://`) and launches native apps like Google Pay, PhonePe, or Paytm directly.
   * **Desktop**: Clicking the button opens `UpiDesktopModal`.
3. **Dynamic QR Generation** ([upi-desktop-modal.jsx](file:///d:/Project/MoneyManager/MoneyManager/components/upi-desktop-modal.jsx)):
   ```javascript
   const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${numAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
   
   // QR Code Image endpoint
   const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;
   ```
   The modal renders `<img src={qrImageUrl} />`, allowing users to scan the QR code from their mobile phone camera.

---

## ⚖️ Feature 2: Integer Paise-Math Group Expense Splitting Algorithm

### 💡 Concept & Problem Solved
* **Problem**: In JavaScript, floating-point arithmetic causes precision loss (e.g. `100 / 3 = 33.333333333333336`). Summing rounded floats back up (`33.33 * 3 = 99.99`) results in 1 paisa lost.
* **Solution**: **Integer Paise Math**. All money calculations convert floating rupees to integer paise (`amount * 100`), compute quotients and remainders using integer division (`Math.floor` and `%`), and distribute the remaining paise 1-by-1 to initial participants.

### 🛠️ Packages & Libraries Used
* Next.js Server Actions (`actions/trips.js`)
* Prisma ORM (`db.$transaction` in PostgreSQL)

### ⚙️ Code Implementation & Execution Flow
Located in [trips.js](file:///d:/Project/MoneyManager/MoneyManager/actions/trips.js#L307-L352):
```javascript
// 1. Convert float rupees to integer paise
const totalCents = Math.round(amountFloat * 100); 
const count = participants.length;

// 2. Integer division quotient and remainder
const baseCents = Math.floor(totalCents / count);
const remainderCents = totalCents % count; // Leftover paise

// 3. Distribute remainder paise 1-by-1 to prevent rounding errors
const splitsData = participants.map((p, index) => {
  // If index < remainder, add 1 extra paisa
  const personCents = baseCents + (index < remainderCents ? 1 : 0);
  const personAmount = personCents / 100;
  const isMe = !p.friendId || p.friendId === "me";

  return {
    amount: personAmount,
    settled: isMe, // "Me" portion is auto-settled
    settledAt: isMe ? new Date() : null,
    friendName: p.friendName || (isMe ? "Me" : "Friend"),
    friendUpiId: p.friendUpiId || null,
    expenseId: createdExpense.id,
    friendId: isMe ? null : p.friendId,
  };
});

// 4. Batch insert into database inside a single Prisma transaction
await tx.expenseSplitEntry.createMany({ data: splitsData });
```
**Example**: Splitting ₹100.00 among 3 participants:
* `totalCents = 10000`, `count = 3`
* `baseCents = 3333` (₹33.33), `remainderCents = 1`
* Participant 1 gets `3333 + 1 = 3334` (₹33.34)
* Participant 2 gets `3333` (₹33.33)
* Participant 3 gets `3333` (₹33.33)
* **Total Sum**: ₹33.34 + ₹33.33 + ₹33.33 = **EXACTLY ₹100.00**.

---

## 🎙️ Feature 3: Web Speech API & AI Voice-to-Transaction Parser

### 💡 Concept
Uses browser native Speech Recognition to convert spoken audio to raw text transcript, which is then fed into an LLM prompt structured to return strict raw JSON data.

### 🛠️ Packages & Libraries Used
* **Frontend**: HTML5 Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
* **Backend AI**: `@google/generative-ai` (`gemini-2.5-flash` model).

### ⚙️ Code Implementation & Execution Flow
1. **Frontend Recording**: Captures audio, streams speech chunks to text transcript string (e.g., *"Spent 1200 rupees on dinner at Taj Hotel"*).
2. **Server Action Call** ([ai.js](file:///d:/Project/MoneyManager/MoneyManager/actions/ai.js#L205-L244)):
   ```javascript
   export async function parseVoiceTransaction(transcript) {
     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

     const prompt = `
       You are an AI speech parser for a financial app. Convert this spoken text into structured JSON.
       Spoken text: "${transcript}"
       Available category IDs: food, transport, shopping, bills, entertainment...

       Extract:
       - amount: string number (e.g. "1200.00")
       - type: "EXPENSE" or "INCOME"
       - description: brief summary
       - category: matching category ID

       Return ONLY a raw JSON object formatted like:
       {"amount": "1200.00", "type": "EXPENSE", "description": "Dinner at Taj Hotel", "category": "food"}
     `;

     const result = await model.generateContent(prompt);
     const text = result.response.text();
     
     // Clean code fence formatting if present
     const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
     const parsed = JSON.parse(cleaned);

     return { success: true, data: parsed };
   }
   ```
3. **Form Autofill**: Frontend listens for the JSON payload and auto-populates the transaction form fields for user review and instant saving.

---

## 🧠 Feature 4: Context-Aware AI Financial Advisor & Insights Engine

### 💡 Concept (Retrieval-Augmented Prompting)
Instead of asking static generic AI questions, Trakex fetches the user's **real-time financial profile** (bank accounts, total net worth, monthly income, monthly expenses, active savings goals, and recent 20 transactions) and injects it as context into the Gemini prompt.

### 🛠️ Packages & Libraries Used
* `@google/generative-ai` (`gemini-2.5-flash`)
* Prisma Client (`db.bankAccount`, `db.transaction`, `db.goal`)
* NextAuth.js (`auth()` for session validation)

### ⚙️ Code Implementation & Execution Flow
Located in [ai.js](file:///d:/Project/MoneyManager/MoneyManager/actions/ai.js#L134-L199):
1. **Context Aggregation**:
   ```javascript
   const session = await auth();
   const accounts = await db.bankAccount.findMany({ where: { userId: session.user.id } });
   const goals = await db.goal.findMany({ where: { userId: session.user.id } });
   const recentTx = await db.transaction.findMany({
     where: { userId: session.user.id, date: { gte: startOfMonth } },
     take: 20,
   });

   const context = `
     User Financial Context:
     - Total Net Worth: $${accounts.reduce((s, a) => s + a.balance.toNumber(), 0)}
     - This Month Income: $${income} | Expenses: $${expense}
     - Savings Goals: ${goals.map(g => `${g.name}: $${g.currentAmount}/$${g.targetAmount}`).join(", ")}
     - Recent Transactions: ${recentTx.map(t => `${t.description}: $${t.amount}`).join("; ")}
   `;
   ```
2. **Prompt Assembly & Model Execution**:
   ```javascript
   const systemPrompt = `You are Trakex AI — an expert financial advisor. Answer clearly using the user's financial context below:\n${context}`;
   const fullPrompt = `${systemPrompt}\n\nConversation History:\n${formattedHistory}\n\nAssistant:`;

   const result = await model.generateContent(fullPrompt);
   return { success: true, reply: result.response.text() };
   ```

---

## 🔄 Feature 5: Automated Recurring Transactions & Inngest Queue Processing

### 💡 Concept
Executes recurring bills/salary credits without requiring the user to open the app. Uses an **Event-Driven Background Job Engine** (**Inngest**) with CRON scheduling and per-user queue throttling.

### 🛠️ Packages & Libraries Used
* `inngest` & `inngest-cli`
* `@prisma/client` (`db.$transaction`)
* `date-fns` (`addDays`, `addWeeks`, `addMonths`, `addYears`, `isBefore`, `isToday`)

### ⚙️ Code Implementation & Execution Flow
Located in [functions.js](file:///d:/Project/MoneyManager/MoneyManager/lib/inngest/functions.js#L11-L133):

1. **Step 1: Daily Midnight CRON Dispatcher**:
   ```javascript
   export const triggerRecurringTransactions = inngest.createFunction(
     { id: "trigger-recurring-transactions", name: "Trigger Recurring Transactions" },
     { cron: "0 0 * * *" }, // Runs every day at 00:00 UTC
     async ({ step }) => {
       const dueTransactions = await step.run("fetch-recurring-transactions", async () => {
         return await db.transaction.findMany({
           where: {
             isRecurring: true,
             status: "COMPLETED",
             OR: [
               { lastProcessed: null },
               { nextRecurringDate: { lte: new Date() } },
             ],
           },
         });
       });

       // Fan-out events into event queue
       const events = dueTransactions.map(tx => ({
         name: "transaction.recurring.process",
         data: { transactionId: tx.id, userId: tx.userId },
       }));
       await inngest.send(events);
     }
   );
   ```

2. **Step 2: Throttled Event Execution**:
   ```javascript
   export const processRecurringTransaction = inngest.createFunction(
     {
       id: "process-recurring-transaction",
       throttle: { limit: 10, period: "1m", key: "event.data.userId" }, // Max 10 per minute per user
     },
     { event: "transaction.recurring.process" },
     async ({ event, step }) => {
       await step.run("process-transaction", async () => {
         await db.$transaction(async (tx) => {
           // 1. Create duplicate completed transaction entry
           await tx.transaction.create({ data: { ...transactionData, isRecurring: false } });

           // 2. Adjust bank account balance
           const balanceChange = transaction.type === "EXPENSE" ? -amount : amount;
           await tx.bankAccount.update({
             where: { id: transaction.bankAccountId },
             data: { balance: { increment: balanceChange } },
           });

           // 3. Compute next recurring date using date-fns
           const nextDate = calculateNextRecurringDate(new Date(), transaction.recurringInterval);
           await tx.transaction.update({
             where: { id: transaction.id },
             data: { lastProcessed: new Date(), nextRecurringDate: nextDate },
           });
         });
       });
     }
   );
   ```

---

## 📧 Feature 6: Background Budget Monitoring & Transactional Email Engine

### 💡 Concept
Periodically checks monthly spending against user-set thresholds. If spending exceeds **80%**, it sends an immediate warning email. On the 1st of every month, it generates a full PDF/HTML summary report with AI insights attached.

### 🛠️ Packages & Libraries Used
* `inngest` (CRON triggers)
* `resend` (Email SDK)
* `@react-email/components` (JSX Email templates in `emails/template.jsx`)

### ⚙️ Code Implementation & Execution Flow
Located in [functions.js](file:///d:/Project/MoneyManager/MoneyManager/lib/inngest/functions.js#L230-L308):
1. **CRON Trigger**: Scheduled every 6 hours (`cron: "0 */6 * * *"`).
2. **Aggregating Monthly Expenses**:
   ```javascript
   const expenses = await db.transaction.aggregate({
     where: {
       userId: budget.userId,
       bankAccountId: defaultAccount.id,
       type: "EXPENSE",
       date: { gte: startOfMonth },
     },
     _sum: { amount: true },
   });
   const totalExpenses = expenses._sum.amount?.toNumber() || 0;
   const percentageUsed = (totalExpenses / budget.amount.toNumber()) * 100;
   ```
3. **Threshold Check & Email Dispatch**:
   ```javascript
   if (percentageUsed >= 80 && isNewMonth(budget.lastAlertSent, new Date())) {
     await sendEmail({
       to: budget.user.email,
       subject: `Trakex Budget Alert: ${percentageUsed.toFixed(0)}% Used`,
       react: EmailTemplate({
         userName: budget.user.name,
         type: "budget-alert",
         data: { percentageUsed, budgetAmount, totalExpenses },
       }),
     });

     await db.budget.update({
       where: { id: budget.id },
       data: { lastAlertSent: new Date() },
     });
   }
   ```

---

## 🎯 Feature 7: Savings Goals & Idempotent Contribution Engine

### 💡 Concept (Idempotency Key Pattern)
Prevents duplicate financial operations caused by accidental double-clicks, slow networks, or retry logic.

### 🛠️ Packages & Libraries Used
* Prisma Schema unique constraints (`idempotencyKey String @unique`)
* `@radix-ui/react-progress`

### ⚙️ Code Implementation & Execution Flow
In [schema.prisma](file:///d:/Project/MoneyManager/MoneyManager/prisma/schema.prisma#L146-L159) and [goals.js](file:///d:/Project/MoneyManager/MoneyManager/actions/goals.js):
```prisma
model GoalContribution {
  id             String   @id @default(uuid())
  amount         Decimal
  idempotencyKey String   @unique // Database level unique constraint
  goalId         String
  userId         String
  createdAt      DateTime @default(now())
}
```
When client calls `addGoalContribution(goalId, amount, idempotencyKey)`:
1. Client generates a random UUID (`crypto.randomUUID()`) when the user opens the modal.
2. Server Action attempts to insert `GoalContribution` inside `db.$transaction`.
3. If duplicate request arrives with the same `idempotencyKey`, PostgreSQL throws a Unique Constraint Violation (Code `P2002`).
4. Server catches error and returns graceful response without double-incrementing the goal's `currentAmount`.

---

## 🛡️ Feature 8: Security, Rate Limiting & Token Bucket Enforcement

### 💡 Concept (Token Bucket Algorithm)
Limits how many high-cost requests a user or IP can perform in a given time window. Tokens refill at a steady rate. If the bucket is empty, requests are blocked with HTTP 429.

### 🛠️ Packages & Libraries Used
* `@arcjet/next` (`tokenBucket` rule)

### ⚙️ Code Implementation & Execution Flow
Located in [arcjet.js](file:///d:/Project/MoneyManager/MoneyManager/lib/arcjet.js):
```javascript
import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Track based on authenticated User ID
  rules: [
    tokenBucket({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      refillRate: 10,  // Adds 10 tokens back
      interval: 3600,  // every 1 hour (3600 seconds)
      capacity: 10,    // Max bucket size
    }),
  ],
});

export default aj;
```

---

## 📊 Summary Table of Packages & Concepts

| Feature Module | Core Concept | Main NPM Packages / APIs | Key File Reference |
| :--- | :--- | :--- | :--- |
| **UPI QR Payment** | URI Deep Link Protocol (`upi://pay`), Mobile OS Intent Routing | `api.qrserver.com`, `@radix-ui/react-dialog` | [upi.js](file:///d:/Project/MoneyManager/MoneyManager/lib/upi.js), [upi-desktop-modal.jsx](file:///d:/Project/MoneyManager/MoneyManager/components/upi-desktop-modal.jsx) |
| **Group Bill Split** | Integer Paise Math (`amount * 100`) to prevent float loss | Next.js Server Actions, Prisma `$transaction` | [trips.js](file:///d:/Project/MoneyManager/MoneyManager/actions/trips.js#L307-L352) |
| **Voice Speech Parser** | Web Speech API + LLM Prompt Engineering for JSON | `@google/generative-ai`, Web Speech API | [ai.js](file:///d:/Project/MoneyManager/MoneyManager/actions/ai.js#L205-L244) |
| **AI Advisor Chat** | Context Injection (Net Worth, Goals, Transactions RAG-lite) | `@google/generative-ai` (`gemini-2.5-flash`) | [ai.js](file:///d:/Project/MoneyManager/MoneyManager/actions/ai.js#L134-L199) |
| **Recurring Engine** | Event-Driven Queue + Serverless Daily CRON Dispatcher | `inngest`, `date-fns` | [functions.js](file:///d:/Project/MoneyManager/MoneyManager/lib/inngest/functions.js#L11-L133) |
| **Budget Email Alerts** | CRON Aggregation + React HTML Email Templating | `resend`, `@react-email/components`, `inngest` | [functions.js](file:///d:/Project/MoneyManager/MoneyManager/lib/inngest/functions.js#L230-L308) |
| **Savings Goal Safety**| Idempotency Key Pattern (PostgreSQL `@unique`) | `@prisma/client` | [schema.prisma](file:///d:/Project/MoneyManager/MoneyManager/prisma/schema.prisma#L146-L159), [goals.js](file:///d:/Project/MoneyManager/MoneyManager/actions/goals.js) |
| **DDoS Rate Limiting** | Token Bucket Algorithm | `@arcjet/next` | [arcjet.js](file:///d:/Project/MoneyManager/MoneyManager/lib/arcjet.js) |

---

*Document updated with full code & engineering implementation details for Trakex.*
