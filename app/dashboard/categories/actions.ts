
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// =====================================
// TYPES
// =====================================

type CategoryFormState = {
  success: boolean;
  message: string;
};

// =====================================
// STEP 05.3 - ADD CATEGORY
// =====================================

export async function addCategory(
  _previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  try {
    // 1. Get category name
    const rawName = formData.get("name");

    if (typeof rawName !== "string") {
      return {
        success: false,
        message: "Please enter a category name.",
      };
    }

    const name = rawName.trim().replace(/\s+/g, " ");

    // 2. Validate
    if (name.length < 2 || name.length > 60) {
      return {
        success: false,
        message: "Category name must be 2 to 60 characters.",
      };
    }

    // 3. Supabase Connection
    const supabase = await createClient();

    // 4. Check logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Please login again.",
      };
    }

    // 5. Admin Check
    const { data: admin, error: adminError } =
      await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError || !admin) {
      return {
        success: false,
        message: "You do not have admin permission.",
      };
    }

    // 6. Duplicate Check
    const { data: existing, error: checkError } =
      await supabase
        .from("categories")
        .select("id")
        .eq("name", name)
        .maybeSingle();

    if (checkError) {
      console.error("Add duplicate check:", checkError);

      return {
        success: false,
        message: "Unable to check category name.",
      };
    }

    if (existing) {
      return {
        success: false,
        message: "This category already exists.",
      };
    }

    // 7. Insert Category
    const { error: insertError } =
      await supabase
        .from("categories")
        .insert({ name });

    if (insertError) {
      console.error("Add Category Error:", insertError);

      if (insertError.code === "23505") {
        return {
          success: false,
          message: "This category already exists.",
        };
      }

      return {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? `Insert failed [${insertError.code}]: ${insertError.message}`
            : "Failed to add category.",
      };
    }

    // 8. Refresh Pages
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Category added successfully!",
    };

  } catch (error) {
    console.error("Unexpected Add Error:", error);

    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}

// =====================================
// STEP 05.4 - UPDATE CATEGORY
// =====================================

export async function updateCategory(
  _previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  try {
    // 1. Get Form Data
    const rawId = formData.get("id");
    const rawName = formData.get("name");

    if (
      typeof rawId !== "string" ||
      typeof rawName !== "string"
    ) {
      return {
        success: false,
        message: "Invalid category information.",
      };
    }

    // 2. Validate Category ID
    const categoryId = Number(rawId);

    if (
      !Number.isSafeInteger(categoryId) ||
      categoryId <= 0
    ) {
      return {
        success: false,
        message: "Invalid category ID.",
      };
    }

    // 3. Validate Name
    const name = rawName.trim().replace(/\s+/g, " ");

    if (name.length < 2 || name.length > 60) {
      return {
        success: false,
        message: "Category name must be 2 to 60 characters.",
      };
    }

    // 4. Supabase Connection
    const supabase = await createClient();

    // 5. Check User
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Please login again.",
      };
    }

    // 6. Admin Check
    const { data: admin, error: adminError } =
      await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError || !admin) {
      return {
        success: false,
        message: "You do not have admin permission.",
      };
    }

    // 7. Find Current Category
    const { data: current, error: fetchError } =
      await supabase
        .from("categories")
        .select("id, name")
        .eq("id", categoryId)
        .maybeSingle();

    if (fetchError) {
      console.error("Edit fetch error:", fetchError);

      return {
        success: false,
        message: "Unable to find category.",
      };
    }

    if (!current) {
      return {
        success: false,
        message: "Category not found.",
      };
    }

    // 8. Check If Name Changed
    if (current.name === name) {
      return {
        success: true,
        message: "No changes needed.",
      };
    }

    // 9. Duplicate Check
    const { data: duplicate, error: duplicateError } =
      await supabase
        .from("categories")
        .select("id")
        .eq("name", name)
        .neq("id", categoryId)
        .limit(1)
        .maybeSingle();

    if (duplicateError) {
      console.error("Edit duplicate check:", duplicateError);

      return {
        success: false,
        message: "Unable to check category name.",
      };
    }

    if (duplicate) {
      return {
        success: false,
        message: "Another category already uses this name.",
      };
    }

    // 10. Update Category
    const { data: updated, error: updateError } =
      await supabase
        .from("categories")
        .update({ name })
        .eq("id", categoryId)
        .select("id")
        .maybeSingle();

    if (updateError) {
      console.error("Update Category Error:", updateError);

      if (updateError.code === "23505") {
        return {
          success: false,
          message: "Another category already uses this name.",
        };
      }

      return {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? `Update failed [${updateError.code}]: ${updateError.message}`
            : "Failed to update category.",
      };
    }

    if (!updated) {
      return {
        success: false,
        message: "Category not updated. Check UPDATE permission.",
      };
    }

    // 11. Refresh Pages
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Category updated successfully!",
    };

  } catch (error) {
    console.error("Unexpected Update Error:", error);

    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}

// =====================================
// STEP 05.5 - DELETE CATEGORY
// =====================================

export async function deleteCategory(
  _previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  try {
    // STEP 1: Get Category ID
    const rawId = formData.get("id");

    if (
      typeof rawId !== "string" ||
      !/^[0-9]+$/.test(rawId)
    ) {
      return {
        success: false,
        message: "Invalid category ID.",
      };
    }

    // STEP 2: Validate ID
    const categoryId = Number(rawId);

    if (
      !Number.isSafeInteger(categoryId) ||
      categoryId <= 0
    ) {
      return {
        success: false,
        message: "Invalid category ID.",
      };
    }

    // STEP 3: Supabase Connection
    const supabase = await createClient();

    // STEP 4: Check Logged-in User
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Please login again.",
      };
    }

    // STEP 5: Verify Admin Permission
    const { data: admin, error: adminError } =
      await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError) {
      console.error("Delete admin check:", adminError);

      return {
        success: false,
        message: "Unable to verify admin access.",
      };
    }

    if (!admin) {
      return {
        success: false,
        message: "You do not have admin permission.",
      };
    }

    // STEP 6: Find Category
    const { data: category, error: findError } =
      await supabase
        .from("categories")
        .select("id, name")
        .eq("id", categoryId)
        .maybeSingle();

    if (findError) {
      console.error("Delete find error:", findError);

      return {
        success: false,
        message: "Unable to find category.",
      };
    }

    if (!category) {
      return {
        success: false,
        message: "Category not found.",
      };
    }

    // IMPORTANT:
    // The database must use RESTRICT or NO ACTION
    // on FKs where related records must be preserved.

    // STEP 7: Delete only this Category ID
    const {
      data: deleted,
      error: deleteError,
    } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .select("id")
      .maybeSingle();

    // STEP 8: Handle Delete Errors
    if (deleteError) {
      console.error("Category DELETE Error:", {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
      });

      // Related records exist
      if (deleteError.code === "23503") {
        return {
          success: false,
          message:
            "Cannot delete this category because related records exist.",
        };
      }

      // RLS or permission error
      if (deleteError.code === "42501") {
        return {
          success: false,
          message: "Delete permission denied. Check RLS policy.",
        };
      }

      return {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? `Delete failed [${deleteError.code}]: ${deleteError.message}`
            : "Failed to delete category.",
      };
    }

    // STEP 9: Verify Record Was Deleted
    if (!deleted) {
      return {
        success: false,
        message:
          "Category was not deleted. Check DELETE permission.",
      };
    }

    // STEP 10: Refresh Pages
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard");

    // STEP 11: Success
    return {
      success: true,
      message: "Category deleted successfully!",
    };

  } catch (error) {
    console.error("Unexpected Delete Error:", error);

    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}
