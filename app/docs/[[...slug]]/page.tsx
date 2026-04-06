import { calcReadTime, lastModified } from "fromsrc";
import { Breadcrumb, Toc } from "fromsrc/client";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

import { repourl, siteurl } from "@/app/_lib/site";

import { MDX } from "../_components/mdx";
import { getAllDocs, getDoc } from "../_lib/content";
import { jsonld, neighbors, ogquery, orderdocs } from "../_lib/pageutil";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

const site = siteurl();
const repo = repourl();

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const docs = await getAllDocs();
  return docs.map((doc) => ({
    slug: doc.slug ? doc.slug.split("/") : [],
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (process.env.NODE_ENV !== "production") {
    noStore();
  }
  const { slug = [] } = await params;
  const doc = await getDoc(slug);

  if (!doc) {
    return { title: "not found" };
  }

  const query = ogquery(doc.title, doc.description);

  return {
    description: doc.description,
    openGraph: {
      description: doc.description,
      images: [{ url: `/api/og?${query}`, width: 1200, height: 630 }],
      title: doc.title,
    },
    title: doc.title,
    twitter: {
      card: "summary_large_image",
      description: doc.description,
      images: [`/api/og?${query}`],
      title: doc.title,
    },
  };
}

function formatdate(date: Date | null): string {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DocPage({ params }: Props) {
  if (process.env.NODE_ENV !== "production") {
    noStore();
  }
  const { slug = [] } = await params;
  const [doc, rawDocs] = await Promise.all([getDoc(slug), getAllDocs()]);
  const allDocs = orderdocs(rawDocs);

  if (!doc) {
    notFound();
  }

  const readTime = calcReadTime(doc.content);
  const modified = lastModified(
    `${process.cwd()}/docs/${doc.slug || "index"}.mdx`
  );
  const { prev, next } = neighbors(allDocs, doc.slug);
  const payload = jsonld(site, slug, doc, modified);
  const editurl = `${repo}/edit/main/docs/${doc.slug || "index"}.mdx`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
      />
      <div className="flex w-full max-w-7xl mx-auto">
        <article className="flex-1 min-w-0 py-12 px-8 lg:px-12">
          <header className="mb-10">
            <div className="mb-3">
              <Breadcrumb base="/docs" />
            </div>
            <h1
              className="text-3xl font-semibold tracking-tight mb-3"
              style={{ color: "#ffffff" }}
            >
              {doc.title}
            </h1>
            {doc.description && (
              <p className="text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                {doc.description}
              </p>
            )}
          </header>

          <div className="prose">
            <MDX source={doc.content} />
          </div>

          <footer
            className="mt-16 pt-6 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="flex items-center justify-between text-xs mb-8"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <div className="flex items-center gap-4">
                {modified && <span>Last updated {formatdate(modified)}</span>}
                <span>{readTime} min read</span>
              </div>
              <a
                href={editurl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white/60 transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit on GitHub
              </a>
            </div>

            <nav className="flex justify-between gap-4">
              {prev ? (
                <Link
                  href={prev.slug ? `/docs/${prev.slug}` : "/docs"}
                  className="group flex items-center gap-3 py-3 px-4 rounded-xl border hover:bg-white/[0.02] transition-colors flex-1"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <svg
                    className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <div className="text-left">
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Previous
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "#e6e6e6" }}
                    >
                      {prev.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={next.slug ? `/docs/${next.slug}` : "/docs"}
                  className="group flex items-center gap-3 py-3 px-4 rounded-xl border hover:bg-white/[0.02] transition-colors flex-1 justify-end"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="text-right">
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Next
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "#e6e6e6" }}
                    >
                      {next.title}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </footer>
        </article>
        <Toc variant="minimal" zigzag />
      </div>
    </>
  );
}
