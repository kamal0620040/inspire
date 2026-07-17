import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Asset } from "@/lib/types";

export function useAssets(folderId: string) {
  const supabase = createClient();
  
  return useQuery<Asset[]>({
    queryKey: ["assets", folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("folder_id", folderId)
        .order("z_index", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) {
        console.error(`Error fetching assets for folder ${folderId}:`, error);
        throw error;
      }

      return (data || []) as Asset[];
    },
    enabled: !!folderId,
  });
}

export function useFolderDetail(folderId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["folder", folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("id", folderId)
        .single();

      if (error) {
        console.error(`Error fetching folder ${folderId}:`, error);
        throw error;
      }

      return data;
    },
    enabled: !!folderId,
  });
}
