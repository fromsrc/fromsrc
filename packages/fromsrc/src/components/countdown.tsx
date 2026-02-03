"use client"

import { useEffect, useState } from "react"

export interface CountdownProps {
	target: Date | string | number
	onComplete?: () => void
	format?: "full" | "compact"
}

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

export function Countdown({ target, onComplete, format = "full" }: CountdownProps) {
	const targetDate = typeof target === "string" || typeof target === "number" ? new Date(target) : target
	const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

	useEffect(() => {
		setTimeLeft(calcTimeLeft(targetDate))

		const timer = setInterval(() => {
			const remaining = calcTimeLeft(targetDate)
			setTimeLeft(remaining)
			if (!remaining) {
				clearInterval(timer)
				onComplete?.()
			}
		}, 1000)

		return () => clearInterval(timer)
	}, [targetDate, onComplete])

	if (!timeLeft) {
		return <span className="font-mono text-muted">00:00:00</span>
	}

	if (format === "compact") {
		return (
			<span className="font-mono">
				{String(timeLeft.hours + timeLeft.days * 24).padStart(2, "0")}:
				{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
			</span>
		)
	}

	return (
		<div className="flex gap-4">
			{timeLeft.days > 0 && (
				<div className="text-center">
					<div className="text-2xl font-bold">{timeLeft.days}</div>
					<div className="text-xs text-muted">days</div>
				</div>
			)}
			<div className="text-center">
				<div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, "0")}</div>
				<div className="text-xs text-muted">hours</div>
			</div>
			<div className="text-center">
				<div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, "0")}</div>
				<div className="text-xs text-muted">min</div>
			</div>
			<div className="text-center">
				<div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, "0")}</div>
				<div className="text-xs text-muted">sec</div>
			</div>
		</div>
	)
}
