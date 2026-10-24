
"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

// ======================================
// TYPES
// ======================================

type Category = {
  id: number;
  name: string;
};

type EditCategoryFormState = {
  success: boolean;
  message: string;
};

type EditCategoryFormProps = {
  category: Category;

  updateCategoryAction: (
    previousState: EditCategoryFormState,
    formData: FormData
  ) => Promise<EditCategoryFormState>;
};

// Initial State
const initialState: EditCategoryFormState = {
  success: false,
  message: "",
};

// ======================================
// EDIT CATEGORY COMPONENT
// ======================================

export function EditCategoryForm({
  category,
  updateCategoryAction,
}: EditCategoryFormProps) {

  // Show or hide edit form
  const [isEditing, setIsEditing] = useState(false);

  // Connect to Server Action
  const [state, formAction, isPending] =
    useActionState(
      updateCategoryAction,
      initialState
    );

  // Close edit form after success
  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
    }
  }, [state]);

  return (
    <div className="space-y-3">

      {/* EDIT BUTTON */}
      {!isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          Edit
        </button>
      )}

      {/* EDIT FORM */}
      {isEditing && (
        <form
          action={formAction}
          className="space-y-3"
        >

          {/* CATEGORY ID */}
          <input
            type="hidden"
            name="id"
            value={category.id}
          />

          {/* CATEGORY NAME */}
          <div>
            <label
              htmlFor={`edit-${category.id}`}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Edit Category Name
            </label>

            <input
              id={`edit-${category.id}`}
              name="name"
              type="text"
              defaultValue={category.name}
              minLength={2}
              maxLength={60}
              required
              disabled={isPending}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          {/* ERROR MESSAGE */}
          {state.message && !state.success && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {state.message}
            </p>
          )}

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-2">

            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-60"
            >
              Cancel
            </button>

          </div>
        </form>
      )}

      {/* SUCCESS MESSAGE */}
      {!isEditing && state.success && (
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
