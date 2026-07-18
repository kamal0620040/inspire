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
