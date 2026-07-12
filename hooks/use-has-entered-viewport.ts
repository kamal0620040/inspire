"use client";
import { useState, useEffect } from 'react';

export function useHasEnteredViewPort(ref: React.RefObject<HTMLDivElement | null>, rootMargin = '0px') {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (isIntersecting) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, isIntersecting, rootMargin]);

  return isIntersecting;
}
