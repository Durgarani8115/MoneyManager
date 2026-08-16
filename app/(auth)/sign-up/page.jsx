import { db } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import bcrypt from "bcryptjs";

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start managing your finances today
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md text-center">
            {error}
          </div>
        )}

        <form
          action={async (formData) => {
            "use server";
            const name = formData.get("name");
            const email = formData.get("email");
            const password = formData.get("password");

            const { redirect } = await import("next/navigation");

            // Check if user exists
            const existingUser = await db.user.findUnique({
              where: { email },
            });

            if (existingUser) {
              return redirect(`/sign-up?error=${encodeURIComponent("User already exists with this email")}`);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await db.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
              },
            });

            try {
              await signIn("credentials", {
                email,
                password,
                redirectTo: "/dashboard",
              });
            } catch (err) {
              if (err instanceof AuthError) {
                return redirect(`/sign-up?error=${err.type}`);
              }
              throw err;
            }
          }}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <Input
                name="name"
                type="text"
                required
                className="mt-1"
                placeholder="Enter your name"
              />
            </div>
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
            Sign up
          </Button>
        </form>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
