
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

// =====================================
// CATEGORIES PAGE CONTENT
// =====================================

async function CategoriesContent() {

  // STEP 1: Wait for incoming request
  await connection();

  // STEP 2: Connect to Supabase
  const supabase = await createClient();

  // STEP 3: Check logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // STEP 4: Check admin permission
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

  // =====================================
  // STEP 5: FETCH CATEGORIES
  // =====================================

  const { data: categories, error: categoryError } =
    await supabase
      .from("categories")
      .select("id, name")
      .order("id", { ascending: true });

  // Log database errors on the server
  if (categoryError) {
    console.error(
      "Failed to fetch categories:",
      categoryError
    );
  }

  // Count fetched categories
  const totalCategories = categories?.length ?? 0;

  // =====================================
  // STEP 6: DISPLAY CATEGORIES
  // =====================================

  return (
    <main className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">

          <h1 className="text-2xl font-bold text-blue-700">
            Rent.lk Admin
          </h1>

          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Back to Dashboard.
          </Link>

        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* Page Title */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Categories Management
          </h2>

          <p className="mt-2 text-slate-600">
            View and manage rental categories
          </p>
        </div>

        {/* Logged in Admin */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Logged in as: {user.email}
          </p>
        </div>

        {/* Total Categories Card */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <h3 className="text-sm font-medium text-slate-500">
            Total Categories
          </h3>

          <p className="mt-3 text-4xl font-bold text-blue-700">
            {categoryError ? "Error" : totalCategories}
          </p>

        </div>

        {/* Categories Table */}
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">

          {/* Table Header */}
          <div className="border-b border-slate-200 p-6">

            <h3 className="text-xl font-semibold text-slate-900">
              Categories List
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              All rental categories from Supabase
            </p>

          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">

            <table className="w-full border-collapse text-left">

              <thead className="bg-slate-50">

                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-sm font-semibold text-slate-700"
                  >
                    ID
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-sm font-semibold text-slate-700"
                  >
                    Category Name
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-200">

                {/* Database Error */}
                {categoryError ? (

                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-8 text-center text-red-600"
                    >
                      Unable to load categories.
                      Please try again.
                    </td>
                  </tr>

                ) : totalCategories === 0 ? (

                  /* Empty Database */
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No categories found.
                    </td>
                  </tr>

                ) : (

                  /* Display Database Records */
                  categories?.map((category) => (

                    <tr
                      key={category.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {category.id}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {category.name}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>
            </table>

          </div>
        </div>

      </section>
    </main>
  );
}

// =====================================
// MAIN CATEGORIES PAGE
// =====================================

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 p-8 text-slate-600">
          Loading Categories...
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
