"use client";

import { useEffect, useRef, useState } from "react";

export interface ElementSize {
  width: number;
  height: number;
}

export function useResizeObserver<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  ElementSize,
] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ height: 0, width: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          height: entry.contentRect.height,
          width: entry.contentRect.width,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
