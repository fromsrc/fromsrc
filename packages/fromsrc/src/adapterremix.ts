"use client";

import { Link as RemixLink, useLocation, useNavigate } from "@remix-run/react";
import { createElement } from "react";

import type {
  FrameworkAdapter,
  fromsrcimageprops,
  fromsrclinkprops,
} from "./adapter";

function Link({ href, children, prefetch, ...rest }: fromsrclinkprops) {
  return createElement(
    RemixLink,
    { prefetch: prefetch ? "intent" : "none", to: href, ...rest },
    children
  );
}

function Image({ src, alt, ...rest }: fromsrcimageprops) {
  return createElement("img", { alt, src, ...rest });
}

function useRemixPathname(): string {
  return useLocation().pathname;
}

function useRemixRouter() {
  const navigate = useNavigate();
  return {
    back: () => navigate(-1),
    push: (url: string) => navigate(url),
  };
}

export const remixAdapter: FrameworkAdapter = {
  Image,
  Link,
  usePathname: useRemixPathname,
  useRouter: useRemixRouter,
};
