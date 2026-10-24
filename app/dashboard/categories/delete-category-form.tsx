
"use client";

import { useActionState, useEffect, useState } from "react";

// =====================================
// TYPES
// =====================================

type Category = {
  id: number;
  name: string;
};

type DeleteCategoryState = {
  success: boolean;
  message: string;
};

type DeleteCategoryFormProps = {
  category: Category;

  deleteCategoryAction: (
    previousState: DeleteCategoryState,
    formData: FormData
  ) => Promise<DeleteCategoryState>;
};

// Initial State
const initialState: DeleteCategoryState = {
  success: false,
  message: "",
};

// =====================================
// DELETE CATEGORY FORM
// =====================================

export function DeleteCategoryForm({
  category,
  deleteCategoryAction,
}: DeleteCategoryFormProps) {

  // Confirmation visibility
  const [showConfirm, setShowConfirm] = useState(false);

  // Server Action State
  const [state, formAction, isPending] =
    useActionState(
      deleteCategoryAction,
      initialState
    );

  // Close Confirmation After Success
  useEffect(() => {
    if (state.success) {
      setShowConfirm(false);
    }
  }, [state.success]);

  return (
    <div className="space-y-3">

      {/* DELETE BUTTON */}
      {!showConfirm && !state.success && (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Delete
        </button>
      )}

      {/* CONFIRMATION FORM */}
      {showConfirm && (
        <form
          action={formAction}
          className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4"
        >

          {/* Hidden Category ID */}
          <input
            type="hidden"
            name="id"
            value={category.id}
          />

          {/* Warning Message */}
          <div>
            <h4 className="text-sm font-semibold text-red-800">
              Are you sure?
            </h4>

            <p className="mt-2 break-words text-sm text-red-700">
              Do you want to delete
              {" "}
              <strong>{category.name}</strong>
              ?
            </p>

            <p className="mt-2 text-xs text-red-600">
              This action cannot be undone.
            </p>
          </div>

          {/* Error Message */}
          {state.message && !state.success && (
            <p
              role="alert"
              className="rounded-lg bg-white p-3 text-sm text-red-700"
            >
              {state.message}
            </p>
          )}

          {/* Confirmation Buttons */}
          <div className="flex flex-wrap gap-2">

            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isPending ? "Deleting..." : "Yes, Delete"}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowConfirm(false)}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>

          </div>
        </form>
      )}

      {/* SUCCESS MESSAGE */}
      {state.success && (
        <p
          role="status"
          className="text-sm font-medium text-green-700"
        >
          {state.message}
        </p>
      )}

    </div>
  );
}
