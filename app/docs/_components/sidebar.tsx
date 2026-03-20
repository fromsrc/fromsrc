import type { SidebarItem, SidebarSection } from "fromsrc/client";

import { getNavigation } from "../_lib/content";
import { SidebarClient } from "./sidebarclient";

export async function Sidebar() {
  const rawNavigation = await getNavigation();

  const navigation: SidebarSection[] = [];

  for (const section of rawNavigation) {
    const root = section.items.every((item) => !item.slug.includes("/"));
    if (root) {
      const items: SidebarItem[] = section.items.map((item) => ({
        href: item.slug ? `/docs/${item.slug}` : "/docs",
        title: item.title,
        type: "item",
      }));
      navigation.push({ items, title: section.title });
      continue;
    }
    const items: SidebarItem[] = section.items.map((item) => ({
      href: `/docs/${item.slug}`,
      title: item.title,
      type: "item",
    }));
    navigation.push({ items, title: section.title });
  }

  return <SidebarClient navigation={navigation} />;
}
