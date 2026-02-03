"use client"

import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"

export interface FeedbackProps {
	onFeedback?: (helpful: boolean) => void | Promise<void>
}

export function Feedback({ onFeedback }: FeedbackProps) {
	const [submitted, setSubmitted] = useState(false)
	const [selected, setSelected] = useState<boolean | null>(null)

	async function handleClick(helpful: boolean) {
		if (submitted) return
		setSelected(helpful)
		setSubmitted(true)
		await onFeedback?.(helpful)
	}

	if (submitted) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted">
				{selected ? "thanks for your feedback" : "sorry to hear that"}
			</div>
		)
	}

	return (
		<div className="flex items-center gap-3">
			<span className="text-sm text-muted">was this helpful?</span>
			<div className="flex gap-1">
				<button
					type="button"
					onClick={() => handleClick(true)}
					className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg transition-colors"
					aria-label="yes, helpful"
				>
					<ThumbsUp className="size-4" aria-hidden />
				</button>
				<button
					type="button"
					onClick={() => handleClick(false)}
					className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg transition-colors"
					aria-label="no, not helpful"
				>
					<ThumbsDown className="size-4" aria-hidden />
				</button>
			</div>
		</div>
	)
}
