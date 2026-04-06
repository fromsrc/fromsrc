"use client";

import { createContext, createElement, useContext } from "react";
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";

import { usePath } from "./browser";

export type FromsrcLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  prefetch?: boolean;
};

export type FromsrcImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "src" | "alt"
> & {
  src: string;
  alt: string;
};

/** Interface for framework-specific routing, linking, and image components */
export interface FrameworkAdapter {
  Link: ComponentType<FromsrcLinkProps>;
  Image?: ComponentType<FromsrcImageProps>;
  usePathname: () => string;
  useRouter: () => { push: (url: string) => void; back: () => void };
  compileMdx?: (source: string, options?: unknown) => Promise<unknown>;
}

function defaultLink({ href, children, ...rest }: FromsrcLinkProps) {
  return createElement("a", { href, ...rest }, children);
}

function defaultImage({ src, alt, ...rest }: FromsrcImageProps) {
  return createElement("img", { alt, src, ...rest });
}

function defaultUsePathname(): string {
  return usePath();
}

function defaultUseRouter() {
  return {
    back: () => {
      if (typeof window !== "undefined") {
        window.history.back();
      }
    },
    push: (url: string) => {
      if (typeof window !== "undefined") {
        window.location.href = url;
      }
    },
  };
}

export const defaultAdapter: FrameworkAdapter = {
  Image: defaultImage,
  Link: defaultLink,
  usePathname: defaultUsePathname,
  useRouter: defaultUseRouter,
};

/** Build a FrameworkAdapter by merging partial overrides with defaults */
export function createAdapter(
  adapter: Partial<FrameworkAdapter>
): FrameworkAdapter {
  return {
    ...defaultAdapter,
    ...adapter,
  };
}

/** React context holding the active FrameworkAdapter */
export const AdapterContext = createContext<FrameworkAdapter>(defaultAdapter);

/** Provider component that supplies a FrameworkAdapter to the tree */
export function AdapterProvider({
  adapter,
  children,
}: {
  adapter: FrameworkAdapter;
  children: ReactNode;
}) {
  return createElement(AdapterContext.Provider, { value: adapter }, children);
}

/** Hook to access the current FrameworkAdapter from context */
export function useAdapter(): FrameworkAdapter {
  return useContext(AdapterContext);
}
