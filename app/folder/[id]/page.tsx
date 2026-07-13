import FolderView from "@/components/folder/folder-view";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FolderPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  
  const query = supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();;
  
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return <FolderView folderData={data} />;
}
