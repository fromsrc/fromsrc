import type { DocMeta } from "fromsrc";

interface docrow {
  slug: string;
  title: string;
  description?: string;
}

export function orderdocs(docs: DocMeta[]): DocMeta[] {
  const intro: DocMeta[] = [];
  const components: DocMeta[] = [];
  const api: DocMeta[] = [];
  const other: DocMeta[] = [];

  for (const doc of docs) {
    if (doc.slug.startsWith("components/")) {
      components.push(doc);
    } else if (doc.slug.startsWith("api/")) {
      api.push(doc);
    } else if (!doc.slug || doc.slug.match(/^[^/]+$/)) {
      intro.push(doc);
    } else {
      other.push(doc);
    }
  }

  const sort = (a: DocMeta, b: DocMeta) => (a.order ?? 999) - (b.order ?? 999);
  return [
    ...intro.toSorted(sort),
    ...components.toSorted(sort),
    ...api.toSorted(sort),
    ...other.toSorted(sort),
  ];
}

export function neighbors(
  docs: DocMeta[],
  slug: string
): { prev: DocMeta | null; next: DocMeta | null } {
  const index = docs.findIndex((doc) => doc.slug === slug);
  if (index === -1) {
    return { next: null, prev: null };
  }
  return {
    next: index < docs.length - 1 ? (docs[index + 1] ?? null) : null,
    prev: index > 0 ? (docs[index - 1] ?? null) : null,
  };
}

export function ogquery(title: string, description?: string): URLSearchParams {
  const query = new URLSearchParams({ title });
  if (description) {
    query.set("description", description);
  }
  return query;
}

export function jsonld(
  site: string,
  slug: string[],
  doc: docrow,
  modified: Date | null
): unknown[] {
  const path = doc.slug ? `/docs/${doc.slug}` : "/docs";
  const url = `${site}${path}`;
  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: doc.title,
    description: doc.description,
    url,
    author: { "@type": "Organization", name: "fromsrc" },
    publisher: { "@type": "Organization", name: "fromsrc", url: site },
    ...(modified && { dateModified: modified.toISOString() }),
    mainEntityOfPage: { "@id": url, "@type": "WebPage" },
  };
  const items = [
    { "@type": "ListItem", item: site, name: "Home", position: 1 },
    { "@type": "ListItem", item: `${site}/docs`, name: "Docs", position: 2 },
    ...slug.map((segment, index) => ({
      "@type": "ListItem",
      item: `${site}/docs/${slug.slice(0, index + 1).join("/")}`,
      name: segment,
      position: index + 3,
    })),
  ];
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
  return [article, breadcrumb];
}
