export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "f8c87b99c6d37651a02fb420ef1e92d6e3c091adab4d3eb97534b172a6b281bf",
  pages: {
    signIn: "/sign-in",
  },
  providers: [], // Add providers with an empty array for now
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isPublicRoute = [
        "/",
        "/sign-in",
        "/sign-up"
      ].includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/api/");
      
      const isProtectedRoute = !isPublicRoute;
      
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to /sign-in
      } else if (isLoggedIn) {
        const isAuthRoute = nextUrl.pathname.startsWith("/sign-in") || nextUrl.pathname.startsWith("/sign-up");
        if (isAuthRoute) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
  },
}
