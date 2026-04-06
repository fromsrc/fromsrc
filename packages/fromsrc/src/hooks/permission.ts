"use client";

import { useEffect, useState } from "react";

export type PermissionName =
  | "camera"
  | "microphone"
  | "geolocation"
  | "notifications"
  | "clipboard-read"
  | "clipboard-write";

export type PermissionState = "granted" | "denied" | "prompt" | "unknown";

interface PermissionQuery {
  query: (options: { name: string }) => Promise<PermissionStatus>;
}

function toState(value: string): PermissionState {
  return value === "granted" || value === "denied" || value === "prompt"
    ? value
    : "unknown";
}

export function usePermission(name: PermissionName): PermissionState {
  const [state, setState] = useState<PermissionState>("unknown");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return;
    }

    let mounted = true;

    (navigator.permissions as PermissionQuery)
      .query({ name })
      .then((status) => {
        if (!mounted) {
          return;
        }
        setState(toState(status.state));
        status.addEventListener("change", () => {
          if (mounted) {
            setState(toState(status.state));
          }
        });
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [name]);

  return state;
}
