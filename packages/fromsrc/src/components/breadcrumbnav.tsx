"use client";

import Link from "next/link";
import { memo } from "react";
import type { JSX, ReactNode } from "react";

export interface BreadcrumbNavProps {
  path: string;
  labels?: Record<string, string>;
  separator?: ReactNode;
  className?: string;
  homeLabel?: string;
  homeHref?: string;
}

interface Crumb {
  href: string;
  label: string;
}

function format(slug: string): string {
  return slug.replaceAll("-", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

function build(path: string, labels?: Record<string, string>): Crumb[] {
  const segments = path.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    href: `/${segments.slice(0, i + 1).join("/")}`,
    label: labels?.[seg] ?? format(seg),
  }));
}

function jsonld(crumbs: Crumb[], homeLabel: string, homeHref: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", item: homeHref, name: homeLabel, position: 1 },
      ...crumbs.map((c, i) => ({
        "@type": "ListItem",
        item: `${homeHref.replace(/\/$/, "")}${c.href}`,
        name: c.label,
        position: i + 2,
      })),
    ],
  })
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function BreadcrumbNavBase({
  path,
  labels,
  separator,
  className,
  homeLabel = "Home",
  homeHref = "/",
}: BreadcrumbNavProps): JSX.Element {
  const crumbs = build(path, labels);
  const sep = separator ?? "/";

  return (
    <nav
      aria-label="breadcrumb"
      className={className ?? "flex items-center gap-1 text-sm text-muted"}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonld(crumbs, homeLabel, homeHref),
        }}
      />
      <ol className="flex items-center gap-1">
        <li>
          <Link href={homeHref} className="hover:text-fg transition-colors">
            {homeLabel}
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <span aria-hidden="true" className="text-dim">
              {sep}
            </span>
            {i === crumbs.length - 1 ? (
              <span aria-current="page" className="text-fg font-medium">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-fg transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const BreadcrumbNav = memo(BreadcrumbNavBase);
