"use client";

import { createContext, createElement, useContext } from "react";
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";

import { usepath } from "./browser";

export type fromsrclinkprops = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  prefetch?: boolean;
};

export type fromsrcimageprops = Omit<
  ComponentPropsWithoutRef<"img">,
  "src" | "alt"
> & {
  src: string;
  alt: string;
};

export interface FrameworkAdapter {
  Link: ComponentType<fromsrclinkprops>;
  Image?: ComponentType<fromsrcimageprops>;
  usePathname: () => string;
  useRouter: () => { push: (url: string) => void; back: () => void };
  compileMdx?: (source: string, options?: unknown) => Promise<unknown>;
}

function defaultLink({ href, children, ...rest }: fromsrclinkprops) {
  return createElement("a", { href, ...rest }, children);
}

function defaultImage({ src, alt, ...rest }: fromsrcimageprops) {
  return createElement("img", { alt, src, ...rest });
}

function defaultUsePathname(): string {
  return usepath();
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

export function createadapter(
  adapter: Partial<FrameworkAdapter>
): FrameworkAdapter {
  return {
    ...defaultAdapter,
    ...adapter,
  };
}

export const AdapterContext = createContext<FrameworkAdapter>(defaultAdapter);

export function AdapterProvider({
  adapter,
  children,
}: {
  adapter: FrameworkAdapter;
  children: ReactNode;
}) {
  return createElement(AdapterContext.Provider, { value: adapter }, children);
}

export function useAdapter(): FrameworkAdapter {
  return useContext(AdapterContext);
}
