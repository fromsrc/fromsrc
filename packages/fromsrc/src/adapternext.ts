"use client";

import NextImage from "next/image";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createElement } from "react";

import type {
  FrameworkAdapter,
  fromsrcimageprops,
  fromsrclinkprops,
} from "./adapter";

function Link({ href, children, prefetch, ...rest }: fromsrclinkprops) {
  return createElement(NextLink, { href, prefetch, ...rest }, children);
}

function Image({ src, alt, width, height, ...rest }: fromsrcimageprops) {
  const nextWidth = Number(width) > 0 ? Number(width) : 1200;
  const nextHeight = Number(height) > 0 ? Number(height) : 630;
  return createElement(NextImage, {
    alt,
    height: nextHeight,
    src,
    width: nextWidth,
    ...rest,
  });
}

function useNextPathname(): string {
  return usePathname();
}

function useNextRouter() {
  const router = useRouter();
  return {
    back: () => router.back(),
    push: (url: string) => router.push(url),
  };
}

export const nextAdapter: FrameworkAdapter = {
  Image,
  Link,
  usePathname: useNextPathname,
  useRouter: useNextRouter,
};
