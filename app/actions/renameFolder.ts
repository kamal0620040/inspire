"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";
import { revalidatePath } from "next/cache";

type RenameFolderResult =
  | { success: true }
  | { success: false; message: string };

export async function renameFolderAction(
  id: string,
  name: string
): Promise<RenameFolderResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("folders")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
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
