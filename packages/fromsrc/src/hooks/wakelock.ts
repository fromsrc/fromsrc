"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface WakeLockResult {
  active: boolean;
  supported: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

interface WakeSentinel {
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
}

interface WakeLockApi {
  request: (type: "screen") => Promise<WakeSentinel>;
}

type WakeLockNavigator = Navigator & { wakeLock?: WakeLockApi };

export function useWakeLock(): WakeLockResult {
  const [active, setActive] = useState(false);
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const sentinelRef = useRef<WakeSentinel | null>(null);

  const request = useCallback(async () => {
    if (!supported) {
      return;
    }
    try {
      const lock = (navigator as WakeLockNavigator).wakeLock;
      if (!lock) {
        return;
      }
      sentinelRef.current = await lock.request("screen");
      sentinelRef.current.addEventListener("release", () => setActive(false));
      setActive(true);
    } catch {}
  }, [supported]);

  const release = useCallback(async () => {
    await sentinelRef.current?.release();
    sentinelRef.current = null;
    setActive(false);
  }, []);

  useEffect(
    () => () => {
      sentinelRef.current?.release();
    },
    []
  );

  return { active, release, request, supported };
}
