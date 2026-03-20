"use client";

import { useCallback, useRef, useState } from "react";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const empty: Rect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
};

export function useMeasure<T extends HTMLElement>(): [
  (node: T | null) => void,
  Rect,
] {
  const [rect, setRect] = useState<Rect>(empty);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node) {
      const observer = new ResizeObserver(() => {
        const r = node.getBoundingClientRect();
        setRect({
          bottom: r.bottom,
          height: r.height,
          left: r.left,
          right: r.right,
          top: r.top,
          width: r.width,
          x: r.x,
          y: r.y,
        });
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  return [ref, rect];
}
