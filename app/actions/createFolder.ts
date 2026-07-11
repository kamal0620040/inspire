"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type CreateFolderResult =
  | { success: true }
  | { success: false; message: string };

export async function createFolderAction(
  name: string
): Promise<CreateFolderResult> {
  const folderName = name.trim();

  if (!folderName) {
    return {
      success: false,
      message: "Folder name is required.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be signed in.",
    };
  }

  const { error } = await supabase.from("folders").insert({
    name: folderName,
    user_id: user.id,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
  };
}