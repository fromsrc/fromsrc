"use client"

import { type JSX, memo, useEffect, useMemo, useRef, useState } from "react"

/**
 * Props for the Countdown component
 */
export interface CountdownProps {
	/** Target date/time to count down to */
	target: Date | string | number
	/** Callback fired when countdown reaches zero */
	onComplete?: () => void
	/** Display format: full shows labeled units, compact shows HH:MM:SS */
	format?: "full" | "compact"
	/** Accessible label describing the countdown purpose */
	label?: string
}

/**
 * Represents remaining time broken into units
 */
interface TimeLeft {
	days: number
	hours: number
	minutes: number
	seconds: number
}

function calcTimeLeft(target: Date): TimeLeft | null {
	const diff = target.getTime() - Date.now()
	if (diff <= 0) return null

	return {
		days: Math.floor(diff / (1000 * 60 * 60 * 24)),
		hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
		minutes: Math.floor((diff / (1000 * 60)) % 60),
		seconds: Math.floor((diff / 1000) % 60),
	}
}

function formatTime(t: TimeLeft): string {
	const parts: string[] = []
	if (t.days > 0) parts.push(`${t.days} day${t.days !== 1 ? "s" : ""}`)
	parts.push(`${t.hours} hour${t.hours !== 1 ? "s" : ""}`)
	parts.push(`${t.minutes} minute${t.minutes !== 1 ? "s" : ""}`)
	parts.push(`${t.seconds} second${t.seconds !== 1 ? "s" : ""}`)
	return parts.join(", ")
}

export const Countdown = memo(function Countdown({
	target,
	onComplete,
	format = "full",
	label,
}: CountdownProps): JSX.Element {
	const targetDate = useMemo<Date>(
		() => (typeof target === "string" || typeof target === "number" ? new Date(target) : target),
		[target],
	)
	const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(targetDate))
	const onCompleteRef = useRef(onComplete)
	onCompleteRef.current = onComplete

	useEffect((): (() => void) => {
		setTimeLeft(calcTimeLeft(targetDate))

		const timer = setInterval((): void => {
			const remaining = calcTimeLeft(targetDate)
			setTimeLeft(remaining)
			if (!remaining) {
				clearInterval(timer)
				onCompleteRef.current?.()
			}
		}, 1000)

		return (): void => clearInterval(timer)
	}, [targetDate])

	const timeDescription = timeLeft ? formatTime(timeLeft) : "countdown complete"
	const ariaLabel = label ? `${label}: ${timeDescription}` : timeDescription

	if (!timeLeft) {
		return (
			<span
				className="font-mono text-muted"
				role="timer"
				aria-live="polite"
				aria-atomic="true"
				aria-label={ariaLabel}
			>
				00:00:00
			</span>
		)
	}

	if (format === "compact") {
		return (
			<span
				className="font-mono"
				role="timer"
				aria-live="polite"
				aria-atomic="true"
				aria-label={ariaLabel}
			>
				{String(timeLeft.hours + timeLeft.days * 24).padStart(2, "0")}:
				{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
			</span>
		)
	}

	return (
		<div
			className="flex gap-4"
			role="timer"
			aria-live="polite"
			aria-atomic="true"
			aria-label={ariaLabel}
		>
			{timeLeft.days > 0 && (
				<div className="text-center" aria-hidden="true">
					<div className="text-2xl font-bold">{timeLeft.days}</div>
					<div className="text-xs text-muted">days</div>
				</div>
			)}
			<div className="text-center" aria-hidden="true">
				<div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, "0")}</div>
				<div className="text-xs text-muted">hours</div>
			</div>
			<div className="text-center" aria-hidden="true">
				<div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, "0")}</div>
				<div className="text-xs text-muted">min</div>
			</div>
			<div className="text-center" aria-hidden="true">
				<div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, "0")}</div>
				<div className="text-xs text-muted">sec</div>
			</div>
		</div>
	)
})
