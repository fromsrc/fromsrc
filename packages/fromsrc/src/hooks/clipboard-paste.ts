"use client";

import { useEffect, useState } from "react";

export interface PasteData {
  text: string | null;
  files: File[];
  timestamp: number;
}

export function useClipboardPaste(): PasteData {
  const [data, setData] = useState<PasteData>({
    files: [],
    text: null,
    timestamp: 0,
  });

  useEffect(() => {
    function handler(e: ClipboardEvent) {
      const text = e.clipboardData?.getData("text/plain") ?? null;
      const files = [...(e.clipboardData?.files ?? [])];
      setData({ files, text, timestamp: Date.now() });
    }

    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, []);

  return data;
}
