"use client";

import { createElement } from "react";

import type {
  FrameworkAdapter,
  FromsrcImageProps,
  FromsrcLinkProps,
} from "./adapter";
import { back, push, usePath } from "./browser";

function link({
  href,
  children,
  prefetch: _prefetch,
  ...rest
}: FromsrcLinkProps) {
  return createElement("a", { href, ...rest }, children);
}

function image({ src, alt, ...rest }: FromsrcImageProps) {
  return createElement("img", { alt, src, ...rest });
}

function pathname(): string {
  return usePath();
}

function router() {
  return {
    back,
    push,
  };
}

export function createBrowserAdapter(): FrameworkAdapter {
  return {
    Image: image,
    Link: link,
    usePathname: pathname,
    useRouter: router,
  };
}
