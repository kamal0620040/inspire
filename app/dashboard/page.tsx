import FolderSection from "@/components/folder-section";
import SearchBar from "@/components/search-bar";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function Dashboard({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("folders")
    .select("*")
    .order("created_at", { ascending: false });

  if (q.trim()) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query;

  console.log("Data: ", data);

  return (
    <div
      className="min-h-dvh w-full overflow-y-auto relative bg-background flex flex-col"
      style={{
        backgroundImage: `radial-gradient(circle, var(--grid) 1.2px, transparent 1.5px)`,
        backgroundSize: `32px 32px`,
      }}
    >
      {/* Floating Top Header (Search & Branding) */}
      <div className="fixed top-6 z-10 w-full">
        <SearchBar
          initialValue={q}
          queryKey="q"
          placeholder="Search folders..."
        />
      </div>

      {/* Main Content */}
      {error ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground text-sm">
            Error loading folders: {error.message}
          </p>
        </div>
      ) : (
        <FolderSection data={data} />
      )}
    </div>
  );
}
