import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md text-center">
            {error === "CredentialsSignin"
              ? "Invalid email or password. Please try again or sign up."
              : "Something went wrong. Please try again."}
          </div>
        )}

        <form
          action={async (formData) => {
            "use server";
            try {
              await signIn("credentials", {
                ...Object.fromEntries(formData),
                redirectTo: "/dashboard",
              });
            } catch (error) {
              if (error instanceof AuthError) {
                const { redirect } = await import("next/navigation");
                return redirect(`/sign-in?error=${error.type}`);
              }
              throw error;
            }
          }}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Email address</label>
              <Input
                name="email"
                type="email"
                required
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <Input
                name="password"
                type="password"
                required
                className="mt-1"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
