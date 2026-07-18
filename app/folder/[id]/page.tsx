import FolderView from "@/components/folder/folder-view";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FolderPage({ params }: PageProps) {
  const [{ id }, supabase] = await Promise.all([params, createClient()]);
  
  const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return <FolderView folderData={data} />;
}
