import FolderSection from "@/components/folder-section";
import SearchBar from "@/components/search-bar";
import FloatingToolbar from "@/components/toolbar/floating-toolbar";
import { createClient } from "@/lib/supabase/server";
import { Folder } from "@/lib/types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function Dashboard({ searchParams }: PageProps) {
  const [{ q = "" }, supabase] = await Promise.all([searchParams, createClient()]);

  let query = supabase
    .from("folders")
    .select(
      `
      *,
      assets:assets(count)
      `,
    )
    .order("created_at", { ascending: false });

  if (q.trim()) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query;

  const modifiedData = data?.map((folder) => ({
    ...folder,
    asset_count: folder.assets?.[0]?.count ?? 0,
  })) as Folder[];

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
        <FolderSection data={modifiedData} />
      )}
      <FloatingToolbar showToolBar={false} />
    </div>
  );
}
