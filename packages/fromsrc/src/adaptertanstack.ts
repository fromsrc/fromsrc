"use client";

import {
  Link as RouterLink,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { createElement } from "react";

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

function useTanstackPathname(): string {
  return useRouterState({ select: (state) => state.location.pathname });
}

function useTanstackRouter() {
  const navigate = useNavigate();
  const router = useRouter();
  return {
    back: () => router.history.back(),
    push: (url: string) => navigate({ to: url }),
  };
}

export const tanstackAdapter: FrameworkAdapter = {
  Image,
  Link,
  usePathname: useTanstackPathname,
  useRouter: useTanstackRouter,
};
