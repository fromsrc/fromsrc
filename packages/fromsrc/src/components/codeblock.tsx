"use client"

import { useState, useRef, type ReactNode } from "react"

const icons: Record<string, string> = {
	typescript: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z",
	javascript: "M0 0h24v24H0V0zm22 20.2l-1.6-1c-.2-.2-.5-.6-.7-1l-1.5.9c.4.7.9 1.3 1.6 1.7.6.4 1.4.6 2.2.6.9 0 1.6-.2 2.2-.7.6-.5.8-1.1.8-1.9 0-.7-.2-1.3-.7-1.7-.4-.4-1-.7-1.9-1-.7-.2-1.1-.4-1.4-.6-.2-.2-.3-.4-.3-.7s.1-.5.3-.7.5-.3.9-.3c.7 0 1.3.3 1.7 1l1.5-1c-.7-1.2-1.8-1.7-3.2-1.7-.9 0-1.6.2-2.2.7-.6.5-.9 1.1-.9 1.9 0 1.2.8 2.1 2.3 2.6.9.3 1.4.5 1.6.7.2.2.3.4.3.7s-.1.5-.4.7c-.3.2-.6.3-1.1.3-.9 0-1.6-.4-2-1.2zM8 13.2c-.1.4-.4.8-.6 1l-1.5-.9c.3-.4.5-.9.6-1.3.1-.5.2-1.2.2-2.3V5h1.9v4.7c0 1.4-.1 2.4-.4 3.2-.1.1-.1.2-.2.3z",
	jsx: "M7.5 12L3 18h3l3-4.5L12 18h3l-4.5-6L15 6h-3l-3 4.5L6 6H3l4.5 6z",
	tsx: "M7.5 12L3 18h3l3-4.5L12 18h3l-4.5-6L15 6h-3l-3 4.5L6 6H3l4.5 6z",
	python: "M12 0C5.5 0 5.9 2.6 5.9 2.6l.1 2.7h6.2v.8H3.9S0 5.7 0 12c0 6.3 3.4 6.1 3.4 6.1h2V15s-.1-3.4 3.4-3.4h5.8s3.2.1 3.2-3.1V3.1S18.3 0 12 0zM8.8 1.8c.6 0 1 .5 1 1s-.5 1-1 1-1-.5-1-1 .5-1 1-1z",
	rust: "M23.8 12l-1.2-.7.3-.4c.1-.2.1-.5-.1-.7l-.6-.6.2-.5c.1-.3 0-.5-.2-.7l-.7-.5.1-.5c0-.3-.1-.5-.3-.6l-.8-.4v-.5c0-.3-.2-.5-.4-.6l-.9-.2-.1-.5c-.1-.3-.3-.5-.6-.5l-.9-.1-.2-.5c-.1-.2-.4-.4-.6-.4h-1l-.3-.4c-.2-.2-.5-.3-.7-.2l-1 .1-.4-.3c-.2-.2-.5-.2-.7-.1l-1 .3-.4-.2c-.3-.1-.5 0-.7.1l-.9.5-.5-.1c-.3-.1-.5 0-.7.2l-.8.6-.5-.1c-.3 0-.5.1-.7.3l-.6.7-.5.1c-.3.1-.5.3-.5.5l-.4.9-.4.2c-.3.1-.4.3-.4.6l-.2 1-.4.3c-.2.2-.3.4-.2.7l.1 1-.3.4c-.2.2-.2.5-.1.7l.3 1-.2.5c-.1.2 0 .5.1.7l.5.9-.1.5c0 .3.1.5.3.7l.6.8v.5c.1.3.3.5.5.5l.8.5.1.5c.1.3.3.5.6.5l.9.3.2.5c.2.2.4.4.7.3l1 .1.3.4c.2.2.5.3.7.2l1-.2.4.3c.2.2.5.2.7.1l1-.4.5.2c.3.1.5 0 .7-.2l.8-.6.5.1c.3 0 .5-.2.7-.4l.6-.8.5-.1c.3-.1.5-.3.5-.6l.3-.9.4-.2c.3-.1.4-.4.4-.7l.1-1 .4-.3c.2-.2.3-.5.1-.7l-.2-1 .3-.4c.1-.3.1-.5-.1-.7l-.4-.9.2-.5zM12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z",
	go: "M1.8 8.4c-.1 0-.1 0-.2-.1 0 0 0-.1.1-.2l.6-.5h2.1l.6.5c.1 0 .1.1 0 .2l-.1.1H1.8zm-.8 1.3c-.1 0-.2 0-.2-.1 0 0 0-.1.1-.2l.6-.5h3.4l.5.5c.1.1.1.1 0 .2 0 0-.1.1-.2.1H1zm2.5 1.3c-.1 0-.1 0-.2-.1 0-.1 0-.1.1-.2l.4-.5h2l.6.5c.1.1.1.1.1.2l-.2.1H3.5zm15.1-.9c-.6 1.4-2 2.4-3.6 2.4-1.3 0-2.5-.6-3.2-1.6-.7.9-1.8 1.5-3.1 1.5-2.2 0-4-1.8-4-4s1.8-4 4-4c1.3 0 2.4.6 3.1 1.5.8-1 2-1.6 3.3-1.6 2.2 0 4 1.8 4 4 0 .6-.2 1.2-.4 1.8h-.1z",
	bash: "M4 20h4v-4H4v4zm6-16v4h4V4h-4zm0 12h4v-4h-4v4zm6-12v4h4V4h-4zm0 12h4v-4h-4v4zM4 4h4v4H4V4zm0 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z",
	shell: "M4 20h4v-4H4v4zm6-16v4h4V4h-4zm0 12h4v-4h-4v4zm6-12v4h4V4h-4zm0 12h4v-4h-4v4zM4 4h4v4H4V4zm0 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z",
	json: "M5 3h2v2H5v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5h2v2H5c-1.1 0-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z",
	css: "M1.5 0h21l-1.9 21.6L12 24l-8.6-2.4L1.5 0zm17.1 4.4H5.4l.3 3.4h12.6l-.9 9.8-5.4 1.5-5.4-1.5-.4-4h3.3l.2 2 2.3.6 2.3-.6.3-2.8H5.9l-.8-9.2h13.8l-.3 3.4z",
	html: "M1.5 0h21l-1.9 21.6L12 24l-8.6-2.4L1.5 0zM20 4H4l.7 7.3h11.4l-.4 4-3.7 1-3.7-1-.2-2.7H5l.5 5.4 6.5 1.8 6.5-1.8.8-9H7.6l-.3-3h13.4L20 4z",
	yaml: "M2.6 6l3.8 5.6v6.4h2.7v-6.4L12.9 6h-3l-2 3.8L5.6 6H2.6zm9.9 12h9.5v-2.5h-6.8v-2.3h5.5V11h-5.5V8.5h6.8V6h-9.5v12z",
	markdown: "M2 4v16h20V4H2zm3 12v-5.5L7.5 13 10 10.5V16h2v-8h-2l-2.5 3L5 8H3v8h2zm11-1.5L13 11h2V8h3v3h2l-3 3.5z",
	md: "M2 4v16h20V4H2zm3 12v-5.5L7.5 13 10 10.5V16h2v-8h-2l-2.5 3L5 8H3v8h2zm11-1.5L13 11h2V8h3v3h2l-3 3.5z",
}

const aliases: Record<string, string> = {
	ts: "typescript",
	js: "javascript",
	sh: "bash",
	zsh: "bash",
	yml: "yaml",
}

function LanguageIcon({ lang }: { lang: string }) {
	const normalized = aliases[lang] || lang
	const path = icons[normalized]
	if (!path) return null

	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			style={{ width: 14, height: 14, flexShrink: 0 }}
			aria-hidden="true"
		>
			<path d={path} />
		</svg>
	)
}

function CopyButton({ codeRef }: { codeRef: React.RefObject<HTMLElement | null> }) {
	const [copied, setCopied] = useState(false)

	const copy = async () => {
		const code = codeRef.current?.textContent || ""
		await navigator.clipboard.writeText(code)
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<button
			type="button"
			onClick={copy}
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
				borderRadius: "4px",
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

interface CodeBlockProps {
	children: ReactNode
	lang?: string
	title?: string
}

export function CodeBlock({ children, lang, title }: CodeBlockProps) {
	const codeRef = useRef<HTMLDivElement>(null)
	const label = title || lang

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
			{label && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "0 12px",
						height: "36px",
						borderBottom: "1px solid #1c1c1c",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						{lang && <LanguageIcon lang={lang} />}
						<span style={{ fontSize: "12px", color: "#737373" }}>{label}</span>
					</div>
					<CopyButton codeRef={codeRef} />
				</div>
			)}
			<div
				ref={codeRef}
				style={{
					padding: "14px 16px",
					overflow: "auto",
					fontSize: "13px",
					lineHeight: "1.6",
					maxHeight: "500px",
				}}
			>
				{children}
			</div>
			{!label && (
				<div style={{ position: "absolute", top: "8px", right: "8px" }}>
					<CopyButton codeRef={codeRef} />
				</div>
			)}
		</figure>
	)
}
