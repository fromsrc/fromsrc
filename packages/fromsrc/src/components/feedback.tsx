"use client"

import { useCallback, useState } from "react"
import { IconThumbsDown, IconThumbsUp } from "./icons"

export interface FeedbackProps {
	onFeedback?: (helpful: boolean) => void | Promise<void>
}

export function Feedback({ onFeedback }: FeedbackProps) {
	const [submitted, setSubmitted] = useState(false)
	const [selected, setSelected] = useState<boolean | null>(null)

	const handleClick = useCallback(
		async (helpful: boolean) => {
			if (submitted) return
			setSelected(helpful)
			setSubmitted(true)
			await onFeedback?.(helpful)
		},
		[submitted, onFeedback],
	)

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
					<IconThumbsUp size={16} />
				</button>
				<button
					type="button"
					onClick={() => handleClick(false)}
					className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg transition-colors"
					aria-label="no, not helpful"
				>
					<IconThumbsDown size={16} />
				</button>
			</div>
		</div>
	)
}
