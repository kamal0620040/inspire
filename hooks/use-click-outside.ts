"use client";

import { RefObject, useEffect, useEffectEvent } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true
) {
  const handleEvent = useEffectEvent(() => {
    handler();
  });
  useEffect(() => {
    if (!enabled) return;

    function listener(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      handleEvent();
    }

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [enabled, ref]);
}