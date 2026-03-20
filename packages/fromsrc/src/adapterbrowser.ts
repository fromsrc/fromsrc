"use client";

import { createElement } from "react";

import type {
  FrameworkAdapter,
  fromsrcimageprops,
  fromsrclinkprops,
} from "./adapter";
import { back, push, usepath } from "./browser";

function link({
  href,
  children,
  prefetch: _prefetch,
  ...rest
}: fromsrclinkprops) {
  return createElement("a", { href, ...rest }, children);
}

function image({ src, alt, ...rest }: fromsrcimageprops) {
  return createElement("img", { alt, src, ...rest });
}

function pathname(): string {
  return usepath();
}

function router() {
  return {
    back,
    push,
  };
}

export function createbrowseradapter(): FrameworkAdapter {
  return {
    Image: image,
    Link: link,
    usePathname: pathname,
    useRouter: router,
  };
}
