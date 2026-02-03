"use client"

import { type CSSProperties, type ReactNode, useEffect, useState } from "react"

interface TerminalProps {
	title?: string
	children: ReactNode
}

export function Terminal({ title = "Terminal", children }: TerminalProps) {
	return (
		<div className="my-6 rounded-xl border border-line overflow-hidden">
			<div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border-b border-line">
				<div className="flex gap-1.5" aria-hidden="true">
					<div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
					<div className="w-3 h-3 rounded-full bg-[#febc2e]" />
					<div className="w-3 h-3 rounded-full bg-[#28c840]" />
				</div>
				<span className="text-xs text-muted ml-2">{title}</span>
			</div>
			<div className="p-4 bg-[#0a0a0a] font-mono text-sm">{children}</div>
		</div>
	)
}

interface LineProps {
	prompt?: string
	children: ReactNode
}

export function Line({ prompt = "$", children }: LineProps) {
	return (
		<div className="flex gap-2">
			<span className="text-emerald-400 select-none shrink-0">{prompt}</span>
			<span className="text-zinc-300">{children}</span>
		</div>
	)
}

interface OutputProps {
	children: ReactNode
}

export function Output({ children }: OutputProps) {
	return <div className="text-zinc-500 pl-5">{children}</div>
}

interface TypedProps {
	text: string
	speed?: number
}

const caretStyle: CSSProperties = {
	animation: "caret 530ms steps(1) infinite",
}

export function Typed({ text, speed = 50 }: TypedProps) {
	const [displayed, setDisplayed] = useState("")
	const [done, setDone] = useState(false)

	useEffect(() => {
		setDisplayed("")
		setDone(false)
	}, [text])

	useEffect(() => {
		if (done) return
		let i = 0
		const interval = setInterval(() => {
			if (i < text.length) {
				setDisplayed(text.slice(0, i + 1))
				i++
			} else {
				setDone(true)
				clearInterval(interval)
			}
		}, speed)
		return () => clearInterval(interval)
	}, [text, speed, done])

	return (
		<span>
			<style>{`@keyframes caret { 50% { opacity: 0; } }`}</style>
			{displayed}
			{!done && (
				<span style={caretStyle} aria-hidden="true">
					▋
				</span>
			)}
		</span>
	)
}
