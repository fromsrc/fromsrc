/** Site-wide SEO configuration */
export interface SeoConfig {
  baseUrl: string;
  siteName: string;
  titleTemplate?: string;
  defaultImage?: string;
  twitter?: string;
  locale?: string;
}

/** Per-page SEO properties */
export interface PageSeo {
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: "article" | "website";
  publishedAt?: string;
  modifiedAt?: string;
  noindex?: boolean;
}

/** Create SEO utilities for generating meta tags, canonical URLs, and JSON-LD */
export function createSeo(config: SeoConfig) {
  const locale = config.locale ?? "en_US";
  const template = config.titleTemplate ?? "%s";

  function title(page: PageSeo): string {
    return template.replace("%s", page.title);
  }

  function canonical(page: PageSeo): string {
    const base = config.baseUrl.replace(/\/$/, "");
    const path = page.path.startsWith("/") ? page.path : `/${page.path}`;
    return `${base}${path}`;
  }

  function meta(page: PageSeo): Record<string, string>[] {
    const url = canonical(page);
    const formatted = title(page);
    const image = page.image ?? config.defaultImage;
    const type = page.type ?? "article";

    const tags: Record<string, string>[] = [
      { content: formatted, property: "og:title" },
      { content: url, property: "og:url" },
      { content: type, property: "og:type" },
      { content: config.siteName, property: "og:site_name" },
      { content: locale, property: "og:locale" },
      { content: "summary_large_image", name: "twitter:card" },
    ];

    if (page.description) {
      tags.unshift({ content: page.description, name: "description" });
      tags.push({ content: page.description, property: "og:description" });
    }

    if (image) {
      tags.push({ content: image, property: "og:image" });
    }

    if (config.twitter) {
      tags.push({ content: config.twitter, name: "twitter:site" });
    }

    if (page.noindex) {
      tags.push({ content: "noindex,nofollow", name: "robots" });
    }

    return tags;
  }

  function jsonLd(page: PageSeo): object {
    const data: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: title(page),
      publisher: {
        "@type": "Organization",
        name: config.siteName,
      },
      url: canonical(page),
    };

    if (page.description) {
      data.description = page.description;
    }

    const image = page.image ?? config.defaultImage;
    if (image) {
      data.image = image;
    }

    if (page.publishedAt) {
      data.datePublished = page.publishedAt;
    }

    if (page.modifiedAt) {
      data.dateModified = page.modifiedAt;
    }

    return data;
  }

  return { canonical, jsonLd, meta, title };
}
