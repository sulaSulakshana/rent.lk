
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

// Dashboard Content
async function DashboardContent() {

  // 1. Wait for incoming request
  await connection();

  // 2. Connect to Supabase
  const supabase = await createClient();

  // 3. Check logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // 4. Check admin permission
  const { data: admin, error: adminError } =
    await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError) {
    throw new Error("Unable to verify admin access.");
  }

  if (!admin) {
    redirect("/auth/login");
  }

  // 5. Get total categories
  const { count, error: categoryError } =
    await supabase
      .from("categories")
      .select("*", {
        count: "exact",
        head: true,
      });

  // 6. Dashboard UI
  return (
    <main className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">

          <h1 className="text-2xl font-bold text-blue-700">
            Rent.lk Admin
          </h1>

          {/* Logout Button */}
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </form>

        </div>
      </header>

      {/* Dashboard */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        <h2 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="mt-3 text-slate-600">
          Welcome, {user.email}
        </p>

        {/* Dashboard Stats */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">

          {/* Categories Card - Clickable */}
          <Link
            href="/dashboard/categories"
            className="block rounded-xl bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            <h3 className="text-sm font-medium text-slate-500">
              Total Categories
            </h3>

            <p className="mt-3 text-4xl font-bold text-blue-700">
              {categoryError ? "Error" : (count ?? 0)}
            </p>

            <p className="mt-4 text-sm font-medium text-blue-600">
              Manage Categories →
            </p>
          </Link>

          {/* Rentals Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">
              Total Rentals
            </h3>

            <p className="mt-3 text-xl font-semibold text-slate-900">
              Coming Soon
            </p>
          </div>

          {/* Services Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">
              Total Services
            </h3>

            <p className="mt-3 text-xl font-semibold text-slate-900">
              Coming Soon
            </p>
          </div>

        </div>

      </section>
    </main>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
