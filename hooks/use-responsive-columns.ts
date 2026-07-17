"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

export function useResponsiveColumns(
  containerRef: React.RefObject<HTMLDivElement | null>,
  breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS
) {
  const [columns, setColumns] = useState(1);

  const calculateColumns = useCallback((width: number) => {
    if (width >= breakpoints.lg) return 4;
    if (width >= breakpoints.md) return 3;
    if (width >= breakpoints.sm) return 2;
    return 1;
  }, [breakpoints]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setColumns(calculateColumns(width));
      }
    });

    observer.observe(container);

    setColumns(calculateColumns(container.clientWidth));

    return () => observer.disconnect();
  }, [containerRef, calculateColumns]);

  return columns;
}
