import arcjet, { detectBot, shield } from "@arcjet/next";
import { NextResponse } from "next/server";

const arcjetMode = process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN";

// Create Arcjet instance
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: arcjetMode,
    }),
    detectBot({
      mode: arcjetMode,
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "GO_HTTP", // For Inngest
      ],
    }),
  ],
});

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  // Run Arcjet protection if key is set
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
