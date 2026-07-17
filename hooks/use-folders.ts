import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Folder } from "@/lib/types";

export function useFolders() {
  const supabase = createClient();

  return useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthenticated");

      // Fetch folders with asset count using PostgREST relation count
      const { data, error } = await supabase
        .from("folders")
        .select(`
          *,
          assets:assets(count)
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching folders:", error);
        throw error;
      }

      return (data || []).map((folder: any) => ({
        ...folder,
        asset_count: folder.assets?.[0]?.count ?? 0,
      })) as Folder[];
    },
  });
}

export function useFolderPreview(folderId: string, active: boolean) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["folder-preview", folderId],
    queryFn: async () => {
      // Get the latest 3 assets for the cover fan preview
      const { data, error } = await supabase
        .from("assets")
        .select("id, url, thumbnail_url, type")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error(`Error fetching preview for folder ${folderId}:`, error);
        throw error;
      }

      return data || [];
    },
    enabled: !!folderId && active,
  });
}
