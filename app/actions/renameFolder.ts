"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type RenameFolderResult =
  | { success: true }
  | { success: false; message: string };

export async function renameFolderAction(
  id: string,
  name: string
): Promise<RenameFolderResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("folders")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath(`/folder/${id}`);

  return {
    success: true,
  };
}
