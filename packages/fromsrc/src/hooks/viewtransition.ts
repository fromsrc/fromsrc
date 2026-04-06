"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ViewTransitionResult {
  startTransition: (callback: () => void) => void;
  isTransitioning: boolean;
  supported: boolean;
}

interface Transition {
  finished: Promise<void>;
}

type TransitionDocument = Document & {
  startViewTransition?: (action: () => void) => Transition;
};

export function useViewTransition(): ViewTransitionResult {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const supported =
    typeof document !== "undefined" &&
    typeof (document as TransitionDocument).startViewTransition === "function";

  const startTransition = useCallback(
    (callback: () => void) => {
      if (!supported) {
        callback();
        return;
      }
      setIsTransitioning(true);
      const transition = (document as TransitionDocument).startViewTransition?.(
        callback
      );
      if (!transition) {
        setIsTransitioning(false);
        return;
      }
      transition.finished.finally(() => setIsTransitioning(false));
    },
    [supported]
  );

  return { isTransitioning, startTransition, supported };
}

export function usePageTransition(): void {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const supported =
    typeof document !== "undefined" &&
    typeof (document as TransitionDocument).startViewTransition === "function";

  useEffect(() => {
    if (!supported || pathname === previous.current) {
      return;
    }
    previous.current = pathname;
    (document as TransitionDocument).startViewTransition?.(() => {});
  }, [pathname, supported]);
}
