import { Skeleton } from "@/components/ui/skeleton";

export default function FolderViewSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Top Navigation */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between">
        {/* Back Button */}
        <div className="flex items-center gap-3 rounded-full">
          <Skeleton className="bg-muted-foreground/50 h-8 w-28 rounded-full" />
        </div>

        {/* View Toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full">
          <Skeleton className="bg-muted-foreground/50 h-8 w-20 rounded-full" />
          <Skeleton className=" bg-muted-foreground/50 h-8 w-20 rounded-full" />
        </div>

        {/* Zoom */}
        <Skeleton className="bg-muted-foreground/50 h-8 w-12 rounded-md" />
      </div>

      {/* Canvas */}
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Folder Preview */}
          <Skeleton className="bg-muted-foreground/50 h-24 w-24 rounded-3xl" />

          {/* Title */}
          <Skeleton className="bg-muted-foreground/50 h-5 w-40 rounded-full" />

          {/* Subtitle */}
          <Skeleton className="bg-muted-foreground/50 h-3 w-24 rounded-full" />

          {/* Spinner */}
          <div className="mt-2 flex gap-2">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted-foreground/50 [animation-delay:-0.2s]" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted-foreground/50 [animation-delay:-0.1s]" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/70 p-2 shadow-xl backdrop-blur-xl">
          <Skeleton className="bg-muted-foreground/50 h-10 w-10 rounded-full" />

          <div className="h-6 w-px bg-border" />

          <Skeleton className="bg-muted-foreground/50 h-10 w-10 rounded-full" />
          <Skeleton className="bg-muted-foreground/50 h-10 w-10 rounded-full" />

          <div className="h-6 w-px bg-border" />

          <Skeleton className="bg-muted-foreground/50 h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
