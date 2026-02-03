"use client"

import { memo } from "react"
import type { JSX } from "react"
import { useCallback, useState } from "react"
import { IconThumbsDown, IconThumbsUp } from "./icons"

/**
 * Props for the Feedback component.
 * @property onFeedback - Callback invoked when user submits feedback.
 */
export interface FeedbackProps {
	onFeedback?: (helpful: boolean) => void | Promise<void>
}

function FeedbackBase({ onFeedback }: FeedbackProps): JSX.Element {
	const [submitted, setSubmitted] = useState<boolean>(false)
	const [selected, setSelected] = useState<boolean | null>(null)

	const handlePositive = useCallback(async (): Promise<void> => {
		if (submitted) return
		setSelected(true)
		setSubmitted(true)
		await onFeedback?.(true)
	}, [submitted, onFeedback])

	const handleNegative = useCallback(async (): Promise<void> => {
		if (submitted) return
		setSelected(false)
		setSubmitted(true)
		await onFeedback?.(false)
	}, [submitted, onFeedback])

	if (submitted) {
		return (
			<div
				role="status"
				aria-live="polite"
				className="flex items-center gap-2 text-sm text-muted"
			>
				{selected ? "thanks for your feedback" : "sorry to hear that"}
			</div>
		)
	}

	return (
		<div role="group" aria-label="feedback" className="flex items-center gap-3">
			<span id="feedback-label" className="text-sm text-muted">
				was this helpful?
			</span>
			<div role="group" aria-labelledby="feedback-label" className="flex gap-1">
				<button
					type="button"
					onClick={handlePositive}
					className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg transition-colors"
					aria-label="yes, helpful"
					aria-pressed={selected === true}
				>
					<IconThumbsUp aria-hidden="true" size={16} />
				</button>
				<button
					type="button"
					onClick={handleNegative}
					className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg transition-colors"
					aria-label="no, not helpful"
					aria-pressed={selected === false}
				>
					<IconThumbsDown aria-hidden="true" size={16} />
				</button>
			</div>
		</div>
	)
}

export const Feedback = memo(FeedbackBase)
