
"use client";

import { useActionState, useEffect, useRef } from "react";

// Form State
type CategoryFormState = {
  success: boolean;
  message: string;
};

// Server Action Props
type AddCategoryFormProps = {
  addCategoryAction: (
    previousState: CategoryFormState,
    formData: FormData
  ) => Promise<CategoryFormState>;
};

// Initial State
const initialState: CategoryFormState = {
  success: false,
  message: "",
};

// ======================================
// ADD CATEGORY FORM
// ======================================

export function AddCategoryForm({
  addCategoryAction,
}: AddCategoryFormProps) {

  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] =
    useActionState(addCategoryAction, initialState);

  // Clear input after successful insert
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">

      <h3 className="text-xl font-semibold text-slate-900">
        Add New Category
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Enter a category name to add a new rental category.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-6 space-y-5"
      >

        {/* CATEGORY NAME */}
        <div>
          <label
            htmlFor="categoryName"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Category Name
          </label>

          <input
            id="categoryName"
            name="name"
            type="text"
            placeholder="e.g. Construction Equipment"
            minLength={2}
            maxLength={60}
            required
            disabled={isPending}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 disabled:opacity-60"
          />
        </div>

        {/* SUCCESS / ERROR MESSAGE */}
        {state.message && (
          <div
            role={state.success ? "status" : "alert"}
            aria-live="polite"
            className={`rounded-lg p-4 text-sm ${
              state.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add Category"}
        </button>

      </form>
    </div>
  );
}
