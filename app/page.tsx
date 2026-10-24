
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function CategoryList() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) {
    return (
      <p className="text-red-500">
        Error: {error.message}
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {categories?.map((category) => (
        <div
          key={category.id}
          className="rounded-lg border p-4"
        >
          {category.name}
        </div>
      ))}

      {categories?.length === 0 && (
        <p>No categories found.</p>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">
        Rent.lk Admin Panel
      </h1>

      <p className="mt-2 text-gray-500">
        Supabase Database Connection Test
      </p>

      <Suspense fallback={<p>Loading...</p>}>
        <CategoryList />
      </Suspense>
    </main>
  );
}
