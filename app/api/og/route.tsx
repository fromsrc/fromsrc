import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { z } from "zod"

export const runtime = "edge"

const query = z.object({
	title: z.preprocess(
		(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
		z.string().trim().max(120).default("fromsrc"),
	),
	description: z.preprocess(
		(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
		z.string().trim().max(220).default(""),
	),
})

export async function GET(request: NextRequest) {
	const parsed = query.safeParse({
		title: request.nextUrl.searchParams.get("title") ?? undefined,
		description: request.nextUrl.searchParams.get("description") ?? undefined,
	})
	const title = parsed.success ? parsed.data.title : "fromsrc"
	const description = parsed.success ? parsed.data.description : ""

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "80px",
					backgroundColor: "#0a0a0a",
					fontFamily: "system-ui, sans-serif",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
					<div
						style={{
							fontSize: 56,
							fontWeight: 600,
							color: "#fafafa",
							lineHeight: 1.2,
							maxWidth: "900px",
						}}
					>
						{title}
					</div>
					{description && (
						<div
							style={{
								fontSize: 24,
								color: "#737373",
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
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
						<div
							style={{
								width: "32px",
								height: "32px",
								borderRadius: "6px",
								backgroundColor: "#fafafa",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "18px",
								fontWeight: 700,
								color: "#0a0a0a",
							}}
						>
							f
						</div>
						<div style={{ fontSize: 24, color: "#737373" }}>fromsrc</div>
					</div>
					<div style={{ fontSize: 18, color: "#404040" }}>fromsrc.com</div>
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			headers: {
				"cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
			},
		},
	)
}
