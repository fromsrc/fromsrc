"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends HTMLElement = HTMLElement>(
  options: InViewOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0, rootMargin = "0px", once = false } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        const visible = entry.isIntersecting;
        setInView(visible);
        if (visible && once) {
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}
