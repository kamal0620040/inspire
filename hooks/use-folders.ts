import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

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
