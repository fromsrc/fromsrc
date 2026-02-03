"use client"

import { type KeyboardEvent, useId, useRef, useState } from "react"
import { useCopy } from "../hooks/copy"

const managers = ["npm", "pnpm", "yarn", "bun"] as const
type Manager = (typeof managers)[number]

const commands: Record<Manager, string> = {
	npm: "npm create",
	pnpm: "pnpm create",
	yarn: "yarn create",
	bun: "bun create",
}

function CopyButton({ text }: { text: string }) {
	const { copied, copy } = useCopy()

	return (
		<button
			type="button"
			onClick={() => copy(text)}
			aria-label={copied ? "Copied" : "Copy command"}
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
			onMouseEnter={(e) => {
				if (!copied) e.currentTarget.style.color = "#fafafa"
			}}
			onMouseLeave={(e) => {
				if (!copied) e.currentTarget.style.color = "#737373"
			}}
		>
			{copied ? (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					style={{ width: 14, height: 14 }}
					aria-hidden="true"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			) : (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					style={{ width: 14, height: 14 }}
					aria-hidden="true"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
			)}
		</button>
	)
}

export interface CreateProps {
	package?: string
}

export function Create({ package: pkg = "fromsrc" }: CreateProps) {
	const [active, setActive] = useState<Manager>("npm")
	const command = `${commands[active]} ${pkg}`
	const id = useId()
	const tablistRef = useRef<HTMLDivElement>(null)

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const currentIndex = managers.indexOf(active)
		let nextIndex = currentIndex

		switch (e.key) {
			case "ArrowLeft":
				nextIndex = currentIndex > 0 ? currentIndex - 1 : managers.length - 1
				break
			case "ArrowRight":
				nextIndex = currentIndex < managers.length - 1 ? currentIndex + 1 : 0
				break
			case "Home":
				nextIndex = 0
				break
			case "End":
				nextIndex = managers.length - 1
				break
			default:
				return
		}

		e.preventDefault()
		setActive(managers[nextIndex]!)
		const tabs = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
		tabs?.[nextIndex]?.focus()
	}

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
				<div
					ref={tablistRef}
					role="tablist"
					aria-label="Package managers"
					onKeyDown={handleKeyDown}
					style={{ display: "flex", alignItems: "center", gap: "4px" }}
				>
					{managers.map((m, index) => (
						<button
							key={m}
							id={`${id}-tab-${index}`}
							type="button"
							role="tab"
							aria-selected={active === m}
							aria-controls={`${id}-panel`}
							tabIndex={active === m ? 0 : -1}
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
				id={`${id}-panel`}
				role="tabpanel"
				aria-labelledby={`${id}-tab-${managers.indexOf(active)}`}
				tabIndex={0}
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
