import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";

const query = z.object({
  description: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(220).default("")
  ),
  title: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(120).default("fromsrc")
  ),
});

export function GET(request: NextRequest) {
  const parsed = query.safeParse({
    description: request.nextUrl.searchParams.get("description") ?? undefined,
    title: request.nextUrl.searchParams.get("title") ?? undefined,
  });
  const title = parsed.success ? parsed.data.title : "fromsrc";
  const description = parsed.success ? parsed.data.description : "";

  return new ImageResponse(
    <div
      style={{
        backgroundColor: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            color: "#fafafa",
            fontSize: 56,
            fontWeight: 600,
            lineHeight: 1.2,
            maxWidth: "900px",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              color: "#737373",
              fontSize: 24,
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: "12px" }}>
          <div
            style={{
              alignItems: "center",
              backgroundColor: "#fafafa",
              borderRadius: "6px",
              color: "#0a0a0a",
              display: "flex",
              fontSize: "18px",
              fontWeight: 700,
              height: "32px",
              justifyContent: "center",
              width: "32px",
            }}
          >
            f
          </div>
          <div style={{ color: "#737373", fontSize: 24 }}>fromsrc</div>
        </div>
        <div style={{ color: "#404040", fontSize: 18 }}>fromsrc.com</div>
      </div>
    </div>,
    {
      headers: {
        "cache-control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
      height: 630,
      width: 1200,
    }
  );
}
