


import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// State returned to the form
export type CategoryFormState = {
  success: boolean;
  message: string;
};

// =====================================
// ADD NEW CATEGORY
// =====================================

export async function addCategory(
  previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {

  // STEP 1: Get Category Name
  const rawName = formData.get("name");

  if (typeof rawName !== "string") {
    return {
      success: false,
      message: "Please enter a category name.",
    };
  }

  // Remove extra spaces
  const name = rawName.trim().replace(/\s+/g, " ");

  // STEP 2: Validate Category Name
  if (name.length < 2 || name.length > 60) {
    return {
      success: false,
      message: "Category name must be 2 to 60 characters.",
    };
  }

  // STEP 3: Connect to Supabase
  const supabase = await createClient();

  // STEP 4: Check logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "Please log in again.",
    };
  }

  // STEP 5: Check Admin Permission
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

  // STEP 6: Check Duplicate Category
  const { data: existingCategory, error: checkError } =
    await supabase
      .from("categories")
      .select("id")
      .eq("name", name)
      .maybeSingle();

  if (checkError) {
    console.error("Category check failed:", checkError);

    return {
      success: false,
      message: "Unable to check category name.",
    };
  }

  if (existingCategory) {
    return {
      success: false,
      message: "This category already exists.",
    };
  }

  // STEP 7: Insert New Category
  const { error: insertError } =
    await supabase
      .from("categories")
      .insert({
        name: name,
      });

  // STEP 8: Handle Database Errors
  if (insertError) {

    if (insertError.code === "23505") {
      return {
        success: false,
        message: "This category already exists.",
      };
    }

    console.error("Category insert failed:", insertError);

    return {
      success: false,
      message: "Failed to add category. Check server logs.",
    };
  }

  // STEP 9: Refresh Pages
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard");

  // STEP 10: Return Success
  return {
    success: true,
    message: "Category added successfully!",
  };
}
