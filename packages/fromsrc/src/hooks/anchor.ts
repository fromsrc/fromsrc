"use client";

import { useEffect } from "react";

export interface AnchorOptions {
  offset?: number;
  smooth?: boolean;
}

export function useAnchorScroll(options: AnchorOptions = {}): void {
  const { offset = 80, smooth = true } = options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target instanceof Element)) {
        return;
      }
      const { target } = e;
      const anchor = target.closest("a");

      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href?.startsWith("#")) {
        return;
      }

      const id = href.slice(1);
      const element = document.querySelector(`#${id}`);
      if (!element) {
        return;
      }

      e.preventDefault();

      const top = (element as HTMLElement).offsetTop - offset;
      window.scrollTo({
        behavior: smooth ? "smooth" : "auto",
        top: Math.max(0, top),
      });

      window.history.pushState(null, "", href);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [offset, smooth]);

  useEffect(() => {
    const { hash } = window.location;
    if (!hash) {
      return;
    }

    const id = hash.slice(1);
    const element = document.querySelector(`#${id}`);
    if (!element) {
      return;
    }

    setTimeout(() => {
      const top = (element as HTMLElement).offsetTop - offset;
      window.scrollTo({
        behavior: "auto",
        top: Math.max(0, top),
      });
    }, 100);
  }, [offset]);
}
