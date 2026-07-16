import { useRef, useState, useCallback, useEffect } from "react";

export function useAnchorPosition<T extends HTMLElement>(
  enabled: boolean,
  offset = 8
): {
  anchorRef: React.RefObject<T | null>;
  position: { top: number; left: number } | null;
  update: () => void;
} {
  const anchorRef = useRef<T | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const update = useCallback(() => {
    if (!anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + offset,
      left: rect.left,
    });
  }, [offset]);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition(null);
      return;
    }

    update();

    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, [enabled, update]);

  return {
    anchorRef,
    position,
    update,
  };
}