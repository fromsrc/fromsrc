"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import type { JSX } from "react"
import { usePathname } from "next/navigation"
import { IconThumbsDown, IconThumbsUp } from "./icons"

export interface FeedbackWidgetProps {
	onSubmit?: (data: { helpful: boolean; message?: string; path: string }) => void
}

type Stage = "ask" | "input" | "done"

function FeedbackWidgetBase({ onSubmit }: FeedbackWidgetProps): JSX.Element {
	const path = usePathname()
	const [stage, setStage] = useState<Stage>("ask")
	const [helpful, setHelpful] = useState(false)
	const [message, setMessage] = useState("")
	const [visible, setVisible] = useState(true)
	const inputRef = useRef<HTMLInputElement>(null)

	const select = useCallback((value: boolean) => {
		setHelpful(value)
		setStage("input")
	}, [])

	useEffect(() => {
		if (stage === "input") inputRef.current?.focus()
	}, [stage])

	useEffect(() => {
		if (stage !== "done") return
		const timer = setTimeout(() => setVisible(false), 2000)
		return () => clearTimeout(timer)
	}, [stage])

	const submit = useCallback(() => {
		onSubmit?.({ helpful, message: message.trim() || undefined, path })
		setStage("done")
	}, [helpful, message, path, onSubmit])

	const keydown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") submit()
		},
		[submit],
	)

	return (
		<div
			className={`flex flex-col items-center gap-3 py-8 transition-opacity duration-500 ${
				visible ? "opacity-100" : "opacity-0"
			}`}
		>
			{stage === "ask" && (
				<div className="flex items-center gap-3">
					<span className="text-sm text-muted">was this helpful?</span>
					<div className="flex gap-1">
						<button
							type="button"
							onClick={() => select(true)}
							className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg transition-colors"
							aria-label="yes, helpful"
						>
							<IconThumbsUp aria-hidden="true" size={16} />
						</button>
						<button
							type="button"
							onClick={() => select(false)}
							className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg transition-colors"
							aria-label="no, not helpful"
						>
							<IconThumbsDown aria-hidden="true" size={16} />
						</button>
					</div>
				</div>
			)}

			{stage === "input" && (
				<div className="flex items-center gap-2">
					<input
						ref={inputRef}
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={keydown}
						placeholder="share feedback"
						aria-label="feedback"
						className="h-8 w-56 rounded-md border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted outline-none focus:border-accent transition-colors"
					/>
					<button
						type="button"
						onClick={submit}
						className="h-8 rounded-md border border-line bg-surface px-3 text-sm text-muted hover:text-fg transition-colors"
					>
						send
					</button>
					<button
						type="button"
						onClick={submit}
						className="h-8 rounded-md px-2 text-sm text-muted hover:text-fg transition-colors"
					>
						skip
					</button>
				</div>
			)}

			{stage === "done" && (
				<span className="text-sm text-muted" role="status" aria-live="polite">
					thanks
				</span>
			)}
		</div>
	)
}

export const FeedbackWidget = memo(FeedbackWidgetBase)
