"use client"

import { type CSSProperties, type ReactNode, memo, useCallback, useEffect, useRef, useState } from "react"

/**
 * props for the terminal container component
 */
export interface TerminalProps {
	title?: string
	children: ReactNode
}

/**
 * terminal window with macos-style title bar
 */
export const Terminal = memo(function Terminal({ title = "Terminal", children }: TerminalProps): ReactNode {
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
})

/**
 * props for terminal command line
 */
export interface LineProps {
	prompt?: string
	children: ReactNode
}

/**
 * command line with prompt symbol
 */
export const Line = memo(function Line({ prompt = "$", children }: LineProps): ReactNode {
	return (
		<div className="flex gap-2">
			<span className="text-emerald-400 select-none shrink-0">{prompt}</span>
			<span className="text-zinc-300">{children}</span>
		</div>
	)
})

/**
 * props for terminal output
 */
export interface OutputProps {
	children: ReactNode
}

/**
 * command output text
 */
export const Output = memo(function Output({ children }: OutputProps): ReactNode {
	return <div className="text-zinc-500 pl-5">{children}</div>
})

/**
 * props for typewriter animation
 */
export interface TypedProps {
	text: string
	speed?: number
}

const caretStyle: CSSProperties = {
	animation: "caret 530ms steps(1) infinite",
}

/**
 * typewriter text animation with blinking caret
 */
export function Typed({ text, speed = 50 }: TypedProps): ReactNode {
	const [displayed, setDisplayed] = useState("")
	const [done, setDone] = useState(false)
	const indexRef = useRef(0)

	const reset = useCallback((): void => {
		setDisplayed("")
		setDone(false)
		indexRef.current = 0
	}, [])

	const tick = useCallback((): void => {
		if (indexRef.current < text.length) {
			indexRef.current++
			setDisplayed(text.slice(0, indexRef.current))
		} else {
			setDone(true)
		}
	}, [text])

	useEffect(() => {
		reset()
	}, [text, reset])

	useEffect(() => {
		if (done) return
		const interval = setInterval(tick, speed)
		return (): void => clearInterval(interval)
	}, [text, speed, done, tick])

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
