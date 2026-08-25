import FolderSection from "@/components/folder-section";
import SearchBar from "@/components/search-bar";
import FloatingToolbar from "@/components/toolbar/floating-toolbar";
import BfcacheReset from "@/components/bfcache-reset";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { Folder } from "@/lib/types";
import { Suspense } from "react";

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default function Dashboard({ searchParams }: PageProps) {
  return (
    <div
      className="min-h-dvh w-full overflow-y-auto relative bg-background flex flex-col"
      style={{
        backgroundImage: `radial-gradient(circle, var(--grid) 1.2px, transparent 1.5px)`,
        backgroundSize: `32px 32px`,
      }}
    >
      <Suspense fallback={<DashboardFallback />}>
        <BfcacheReset>
          <DashboardContent searchParams={searchParams} />
        </BfcacheReset>
      </Suspense>
      <FloatingToolbar showToolBar={false} />
    </div>
  );
}

async function DashboardContent({
  searchParams,
}: Pick<PageProps, "searchParams">) {
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
    <>
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
    </>
  );
}

function DashboardFallback() {
  return (
    <>
      {/* Floating Top Header (Search & Branding) */}
      <div className="fixed top-6 z-10 w-full">
        <div className="flex items-center justify-center w-full pointer-events-auto">
          <Skeleton className="bg-muted-foreground/50 h-10 max-w-xl w-full rounded-lg" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center p-8 pt-24 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-6xl w-full">
          <FolderCardSkeleton />
          <div className="hidden md:block">
            <FolderCardSkeleton />
          </div>
          <div className="hidden lg:block">
            <FolderCardSkeleton />
          </div>
        </div>
      </div>
    </>
  );
}

function FolderCardSkeleton() {
  return (
    <div className="relative h-72 w-80 max-w-full select-none pointer-events-none">
      {/* Folder Back */}
      <div className="absolute bottom-6 left-1/2 h-60 w-72 max-w-full -translate-x-1/2 rounded-4xl bg-folder dark:bg-folder">
        <div className="absolute inset-0 rounded-4xl border border-folder-stroke/40 shadow-xl" />
      </div>

      {/* Preview Thumbnail */}
      <Skeleton className="absolute left-1/2 top-12 h-32 w-28 -translate-x-1/2 rounded-2xl bg-muted-foreground/50" />

      {/* Folder Front */}
      <div className="absolute bottom-6 left-1/2 flex h-40 w-72 max-w-full -translate-x-1/2 flex-col justify-end rounded-[28px] border border-folder-stroke bg-folder-top p-6 dark:bg-folder-top">
        <Skeleton className="bg-muted-foreground/50 h-4 w-40 rounded-full" />
      </div>
    </div>
  );
}
