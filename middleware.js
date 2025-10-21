import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/profile(.*)",

])

// Create Arcjet middleware
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    // Shield protection for content and security
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "GO_HTTP", // For Inngest
        // See the full list at https://arcjet.com/bot-list
      ],
    }),
  ],
});

// Create base Clerk middleware
const clerk = clerkMiddleware(async (auth, req) => {
  // Debug: note when clerk middleware runs (non-sensitive)
  try {
    const { userId } = await auth();
    console.debug('[middleware] clerk auth userId:', userId ? 'present' : 'missing');

    if (!userId && isProtectedRoute(req)) {
      // Redirect to local sign-in route to avoid potential Clerk redirect loops
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  } catch (e) {
    console.error('[middleware] clerk auth error:', e && e.message ? e.message : e);
    // On auth errors, redirect to sign-in to break potential refresh loops
    if (isProtectedRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  return NextResponse.next();
});

// Chain middlewares - ArcJet runs first, then Clerk
export default createMiddleware(aj, clerk);


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};