import type { DocMeta } from "./content";

/** Tree node representing a navigation entry with nested children */
export interface NavNode {
  title: string;
  slug: string;
  href?: string;
  children: NavNode[];
  order?: number;
  icon?: string;
  badge?: string;
}

/** Configuration for building a navigation tree from doc metadata */
export interface NavTreeConfig {
  docs: DocMeta[];
  basePath?: string;
  collapsible?: boolean;
}

function titleize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replaceAll('-', " ");
}

/** Build a hierarchical navigation tree from flat doc metadata */
export function buildNavTree(config: NavTreeConfig): NavNode[] {
  const { docs, basePath = "/docs" } = config;
  const root: NavNode[] = [];
  const map = new Map<string, NavNode>();
  const sorted = [...docs].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );

  for (const doc of sorted) {
    const segments = doc.slug.split("/").filter(Boolean);
    if (segments.length === 0) {
      const node: NavNode = {
        children: [],
        href: basePath,
        order: doc.order,
        slug: doc.slug,
        title: doc.title,
      };
      map.set("", node);
      root.push(node);
      continue;
    }
    let parentChildren = root;
    let path = "";
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment) {
        continue;
      }
      path = path ? `${path}/${segment}` : segment;
      const isLast = i === segments.length - 1;
      let existing = map.get(path);
      if (!existing) {
        existing = {
          children: [],
          href: isLast ? `${basePath}/${path}` : undefined,
          order: isLast ? doc.order : undefined,
          slug: path,
          title: isLast ? doc.title : titleize(segment),
        };
        map.set(path, existing);
        parentChildren.push(existing);
      } else if (isLast) {
        existing.title = doc.title;
        existing.href = `${basePath}/${path}`;
        existing.order = doc.order;
      }
      parentChildren = existing.children;
    }
  }

  function sortNodes(nodes: NavNode[]) {
    nodes.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    for (const node of nodes) {
      if (node.children.length > 0) {sortNodes(node.children);}
    }
  }
  sortNodes(root);
  return root;
}

/** Flatten a nested navigation tree into a single-level array */
export function flattenNavTree(nodes: NavNode[]): NavNode[] {
  const result: NavNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children.length > 0) {
      result.push(...flattenNavTree(node.children));
    }
  }
  return result;
}

/** Find a navigation node by slug in a nested tree */
export function findNavNode(nodes: NavNode[], slug: string): NavNode | null {
  for (const node of nodes) {
    if (node.slug === slug) {
      return node;
    }
    const found = findNavNode(node.children, slug);
    if (found) {
      return found;
    }
  }
  return null;
}

/** Build breadcrumb trail from root to the given slug */
export function getNavBreadcrumbs(nodes: NavNode[], slug: string): NavNode[] {
  function walk(current: NavNode[], path: NavNode[]): NavNode[] | null {
    for (const node of current) {
      const next = [...path, node];
      if (node.slug === slug) {
        return next;
      }
      const found = walk(node.children, next);
      if (found) {
        return found;
      }
    }
    return null;
  }
  return walk(nodes, []) ?? [];
}

/** Get previous and next navigable pages relative to a slug */
export function getPrevNext(nodes: NavNode[], slug: string) {
  const flat = flattenNavTree(nodes).filter((n) => n.href);
  const i = flat.findIndex((n) => n.slug === slug);
  if (i === -1) {
    return { next: null, prev: null };
  }
  const prev = i > 0 ? (flat[i - 1] ?? null) : null;
  const next = i < flat.length - 1 ? (flat[i + 1] ?? null) : null;
  return { next, prev };
}
