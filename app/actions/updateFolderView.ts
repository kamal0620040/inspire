"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type UpdateFolderViewResult =
  | { success: true }
  | { success: false; message: string };

export async function updateFolderViewAction(
  id: string,
  view: "canvas" | "board"
): Promise<UpdateFolderViewResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("folders")
    .update({ view, updated_at: new Date().toISOString() })
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
