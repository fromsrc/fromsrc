"use client";

import { createElement } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

import type {
  FrameworkAdapter,
  fromsrcimageprops,
  fromsrclinkprops,
} from "./adapter";

function Link({
  href,
  children,
  prefetch: _prefetch,
  ...rest
}: fromsrclinkprops) {
  return createElement(RouterLink, { to: href, ...rest }, children);
}

function Image({ src, alt, ...rest }: fromsrcimageprops) {
  return createElement("img", { alt, src, ...rest });
}

function useRouterPathname(): string {
  return useLocation().pathname;
}

function useRouterNavigation() {
  const navigate = useNavigate();
  return {
    back: () => navigate(-1),
    push: (url: string) => navigate(url),
  };
}

export const reactRouterAdapter: FrameworkAdapter = {
  Image,
  Link,
  usePathname: useRouterPathname,
  useRouter: useRouterNavigation,
};
