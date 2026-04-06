"use client";

import { useEffect, useState } from "react";

export interface NetworkState {
  online: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

interface ConnectionState {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

type ConnectionNavigator = Navigator & { connection?: ConnectionState };

function getState(): NetworkState {
  if (typeof navigator === "undefined") {
    return { online: true };
  }
  const conn = (navigator as ConnectionNavigator).connection;
  return {
    downlink: conn?.downlink,
    effectiveType: conn?.effectiveType,
    online: navigator.onLine,
    rtt: conn?.rtt,
    saveData: conn?.saveData,
  };
}

export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>(getState);

  useEffect(() => {
    function update() {
      setState(getState());
    }

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as ConnectionNavigator).connection;
    conn?.addEventListener?.("change", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);

  return state;
}
