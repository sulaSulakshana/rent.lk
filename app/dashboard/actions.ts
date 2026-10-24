
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {

  // 1. Connect to Supabase
  const supabase = await createClient();

  // 2. Logout current session
  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  // 3. Check for errors
  if (error) {
    throw new Error("Logout failed. Please try again.");
  }

  // 4. Refresh authenticated pages
  revalidatePath("/", "layout");

  // 5. Redirect to login page
  redirect("/auth/login");
}
