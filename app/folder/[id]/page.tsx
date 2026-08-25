import FolderView from "@/components/folder/folder-view";
import FolderViewSkeleton from "@/components/folder/folder-view-skeleton";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FolderPage({ params }: PageProps) {
  return (
    <Suspense fallback={<FolderViewSkeleton />}>
      <FolderContent params={params} />
    </Suspense>
  );
}

async function FolderContent({ params }: Pick<PageProps, "params">) {
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
