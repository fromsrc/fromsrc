"use client"

import { useState } from "react"
import { useCopy } from "../hooks/copy"

const managers = ["npm", "pnpm", "yarn", "bun"] as const
type Manager = (typeof managers)[number]

const commands: Record<Manager, string> = {
	npm: "npm i",
	pnpm: "pnpm add",
	yarn: "yarn add",
	bun: "bun add",
}

function CopyButton({ text }: { text: string }) {
	const { copied, copy } = useCopy()

	return (
		<button
			type="button"
			onClick={() => copy(text)}
			aria-label={copied ? "Copied" : "Copy code"}
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "6px",
				color: copied ? "#22c55e" : "#737373",
				background: "transparent",
				border: "none",
				cursor: "pointer",
				transition: "color 0.15s",
			}}
			onMouseEnter={(e) => !copied && (e.currentTarget.style.color = "#fafafa")}
			onMouseLeave={(e) => !copied && (e.currentTarget.style.color = "#737373")}
		>
			{copied ? (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }} aria-hidden="true">
					<polyline points="20 6 9 17 4 12" />
				</svg>
			) : (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }} aria-hidden="true">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
			)}
		</button>
	)
}

interface InstallProps {
	package: string
}

export function Install({ package: pkg }: InstallProps) {
	const [active, setActive] = useState<Manager>("npm")
	const command = `${commands[active]} ${pkg}`

	return (
		<figure
			style={{
				position: "relative",
				margin: "24px 0",
				borderRadius: "8px",
				backgroundColor: "#0d0d0d",
				border: "1px solid #1c1c1c",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 12px",
					height: "40px",
					borderBottom: "1px solid #1c1c1c",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
					{managers.map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => setActive(m)}
							style={{
								padding: "4px 10px",
								fontSize: "13px",
								color: active === m ? "#fafafa" : "#737373",
								background: "transparent",
								border: "none",
								cursor: "pointer",
								borderBottom: active === m ? "2px solid #fafafa" : "2px solid transparent",
								marginBottom: "-1px",
								transition: "color 0.15s",
							}}
						>
							{m}
						</button>
					))}
				</div>
				<CopyButton text={command} />
			</div>
			<div
				style={{
					padding: "14px 16px",
					fontSize: "13px",
					lineHeight: "1.6",
					fontFamily: "var(--font-mono), ui-monospace, monospace",
				}}
			>
				<span style={{ color: "#7ee787" }}>{commands[active]}</span>
				<span style={{ color: "#fafafa" }}> {pkg}</span>
			</div>
		</figure>
	)
}
