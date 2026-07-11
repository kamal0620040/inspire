import SearchBar from "@/components/search-bar";

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function Dashboard({ searchParams } : PageProps) {
  const { q = ""} = await searchParams;

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
        <SearchBar initialValue={q} queryKey="q" placeholder="Search folders..." />
      </div>

      {/* Main Content */}
      <div>Main Content</div>
    </div>
  );
}