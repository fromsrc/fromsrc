"use client";

import { useEffect, useState } from "react";

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ height: 0, width: 0 });

  useEffect(() => {
    function update() {
      setSize({ height: window.innerHeight, width: window.innerWidth });
    }

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}
