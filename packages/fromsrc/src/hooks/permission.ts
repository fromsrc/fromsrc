"use client";

import { useEffect, useRef, useState } from "react";

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

  const statusRef = useRef<PermissionStatus | null>(null);
  const handlerRef = useRef<(() => void) | null>(null);

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
        statusRef.current = status;
        setState(toState(status.state));
        const handler = () => {
          if (mounted) {
            setState(toState(status.state));
          }
        };
        handlerRef.current = handler;
        status.addEventListener("change", handler);
      })
      .catch(() => {});

    return () => {
      mounted = false;
      if (statusRef.current && handlerRef.current) {
        statusRef.current.removeEventListener("change", handlerRef.current);
      }
      statusRef.current = null;
      handlerRef.current = null;
    };
  }, [name]);

  return state;
}
