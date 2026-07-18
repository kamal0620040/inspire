"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type DeleteFolderResult =
  | { success: true }
  | { success: false; message: string };

export async function deleteFolderAction(
  id: string
): Promise<DeleteFolderResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}