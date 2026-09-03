"use client";

import { useState, useLayoutEffect } from "react";

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
}

const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
};

// Takes the element itself (not a ref object) so the effect re-runs when a
// conditionally-rendered container mounts. Passing a ref object misses that:
// the effect runs while the ref is still null (e.g. behind a loading
// spinner) and never re-runs because the ref identity is stable.
export function useResponsiveColumns(
  container: HTMLDivElement | null,
  breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS
) {
  const [columns, setColumns] = useState(1);

  useLayoutEffect(() => {
    if (!container) return;

    const calculateColumns = (width: number) => {
      if (width >= breakpoints.lg) return 4;
      if (width >= breakpoints.md) return 3;
      if (width >= breakpoints.sm) return 2;
      return 1;
    };

    // Measure before paint so there is no 1-column flash.
    setColumns(calculateColumns(container.clientWidth));

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setColumns(calculateColumns(entry.contentRect.width));
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [container, breakpoints]);

  return columns;
}
