"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">
        Something went wrong
      </h1>

      <p className="text-muted-foreground text-center max-w-md">
        {error.message}
      </p>

      <Button onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}