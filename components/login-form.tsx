
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();

  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login function
  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      // 1. Check email and password
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError || !data.user) {
        throw new Error("Invalid email or password.");
      }

      // 2. Check admin permission
      const { data: admin, error: adminError } =
        await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();

        throw new Error(
          "You do not have admin permission."
        );
      }

      // 3. Open dashboard
      router.replace("/dashboard");
      router.refresh();

    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email Address
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-xs text-slate-500">
        Authorized administrators only
      </p>
    </form>
  );
}
