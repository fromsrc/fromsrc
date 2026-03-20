"use client";

import { useCallback, useEffect, useState } from "react";

export interface GeoPosition {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(watch = false): GeoPosition {
  const [pos, setPos] = useState<GeoPosition>({
    accuracy: null,
    error: null,
    latitude: null,
    loading: true,
    longitude: null,
  });

  const onSuccess = useCallback((p: GeolocationPosition) => {
    setPos({
      accuracy: p.coords.accuracy,
      error: null,
      latitude: p.coords.latitude,
      loading: false,
      longitude: p.coords.longitude,
    });
  }, []);

  const onError = useCallback((e: GeolocationPositionError) => {
    setPos((prev) => ({ ...prev, error: e.message, loading: false }));
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPos((prev) => ({ ...prev, error: "unsupported", loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    if (watch) {
      const id = navigator.geolocation.watchPosition(onSuccess, onError);
      return () => navigator.geolocation.clearWatch(id);
    }
  }, [watch, onSuccess, onError]);

  return pos;
}
