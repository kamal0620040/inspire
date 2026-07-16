"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type DeleteFolderResult =
  | { success: true }
  | { success: false; message: string };

export async function deleteFolderAction(
  id: string
): Promise<DeleteFolderResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}