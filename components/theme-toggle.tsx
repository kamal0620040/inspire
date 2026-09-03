"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={
          compact
            ? "inline-flex h-8 w-8 items-center justify-center rounded-full"
            : "inline-flex h-10 w-10 items-center justify-center rounded-lg border"
        }
        aria-label="Toggle theme"
        suppressHydrationWarning
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={
        compact
          ? "inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
          : "inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-lg border transition hover:bg-accent"
      }
      aria-label="Toggle theme"
    >
      <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
    </button>
  );
}