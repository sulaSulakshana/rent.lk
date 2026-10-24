
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Forms
import { AddCategoryForm } from "./add-category-form";
import { EditCategoryForm } from "./edit-category-form";
import { DeleteCategoryForm } from "./delete-category-form";

// Server Actions
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "./actions";

// =====================================
// CATEGORIES CONTENT
// =====================================

async function CategoriesContent() {

  // STEP 1: Wait for user request
  await connection();

  // STEP 2: Supabase Connection
  const supabase = await createClient();

  // STEP 3: Check Logged-in User
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // STEP 4: Admin Permission Check
  const {
    data: admin,
    error: adminError,
  } = await supabase
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

  // STEP 5: Fetch Categories
  const {
    data: categories,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select("id, name")
    .order("id", { ascending: true });

  if (categoryError) {
    console.error(
      "Categories fetch error:",
      categoryError
    );
  }

  // STEP 6: Total Categories
  const totalCategories = categories?.length ?? 0;

  // =====================================
  // PAGE DESIGN
  // =====================================

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}
      <header className="border-b bg-white shadow-sm">

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">

          <h1 className="text-2xl font-bold text-blue-700">
            Rent.lk Admin
          </h1>

          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Back to Dashboard
          </Link>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* PAGE TITLE */}
        <div>

          <h2 className="text-3xl font-bold text-slate-900">
            Categories Management
          </h2>

          <p className="mt-2 text-slate-600">
            Add, view, edit and delete rental categories
          </p>

        </div>

        {/* ADMIN DETAILS */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4">

          <p className="text-sm text-blue-800">
            Logged in as: {user.email}
          </p>

        </div>

        {/* TOTAL CATEGORIES CARD */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <h3 className="text-sm font-medium text-slate-500">
            Total Categories
          </h3>

          <p className="mt-3 text-4xl font-bold text-blue-700">
            {categoryError ? "Error" : totalCategories}
          </p>

        </div>

        {/* =====================================
            ADD CATEGORY FORM
        ===================================== */}

        <div className="mt-8">

          <AddCategoryForm
            addCategoryAction={addCategory}
          />

        </div>

        {/* =====================================
            CATEGORIES TABLE
        ===================================== */}

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">

          {/* TABLE HEADER */}
          <div className="border-b border-slate-200 p-6">

            <h3 className="text-xl font-semibold text-slate-900">
              Categories List
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage all rental categories from Supabase
            </p>

          </div>

          {/* TABLE CONTENT */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px] border-collapse text-left">

              {/* TABLE HEAD */}
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

                  <th
                    scope="col"
                    className="px-6 py-4 text-sm font-semibold text-slate-700"
                  >
                    Actions
                  </th>

                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-slate-200">

                {/* DATABASE ERROR */}
                {categoryError ? (

                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-red-600"
                    >
                      Unable to load categories.
                    </td>
                  </tr>

                ) : totalCategories === 0 ? (

                  /* EMPTY TABLE */
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No categories found.
                    </td>
                  </tr>

                ) : (

                  /* CATEGORY RECORDS */
                  categories?.map((category) => (

                    <tr
                      key={category.id}
                      className="align-top transition hover:bg-slate-50"
                    >

                      {/* CATEGORY ID */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {category.id}
                      </td>

                      {/* CATEGORY NAME */}
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {category.name}
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="min-w-[330px] px-6 py-4">

                        <div className="flex flex-wrap items-start gap-3">

                          {/* EDIT CATEGORY */}
                          <EditCategoryForm
                            category={category}
                            updateCategoryAction={updateCategory}
                          />

                          {/* DELETE CATEGORY */}
                          <DeleteCategoryForm
                            category={category}
                            deleteCategoryAction={deleteCategory}
                          />

                        </div>

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
// MAIN PAGE COMPONENT
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
