"use client";

export function CanvasLoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
      <div className="px-4 py-2 bg-glass rounded-full border border-dark/40 dark:border-white/80 shadow-lg flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
        <span className="text-xs font-semibold text-neutral-600">
          Syncing assets...
        </span>
      </div>
    </div>
  );
}
