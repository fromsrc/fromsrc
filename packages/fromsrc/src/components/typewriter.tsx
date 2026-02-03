"use client"

import type { JSX } from "react"
import { memo, useEffect, useState } from "react"

/**
 * Props for the Typewriter component
 */
export interface TypewriterProps {
	/** Array of words to cycle through */
	words: string[]
	/** Typing speed in milliseconds per character */
	speed?: number
	/** Delay before deleting in milliseconds */
	delay?: number
	/** Whether to loop through words continuously */
	loop?: boolean
}

const DELETE_SPEED_FACTOR = 0.5

function TypewriterBase({
	words,
	speed = 100,
	delay = 2000,
	loop = true,
}: TypewriterProps): JSX.Element {
	const [index, setIndex] = useState<number>(0)
	const [text, setText] = useState<string>("")
	const [deleting, setDeleting] = useState<boolean>(false)

	useEffect((): void | (() => void) => {
		const word = words[index]
		if (!word) return

		if (deleting) {
			if (text === "") {
				setDeleting(false)
				setIndex((i: number): number =>
					loop ? (i + 1) % words.length : Math.min(i + 1, words.length - 1)
				)
				return
			}

			const timeout = setTimeout((): void => {
				setText((t: string): string => t.slice(0, -1))
			}, speed * DELETE_SPEED_FACTOR)
			return (): void => clearTimeout(timeout)
		}

		if (text === word) {
			if (!loop && index === words.length - 1) return

			const timeout = setTimeout((): void => {
				setDeleting(true)
			}, delay)
			return (): void => clearTimeout(timeout)
		}

		const timeout = setTimeout((): void => {
			setText(word.slice(0, text.length + 1))
		}, speed)
		return (): void => clearTimeout(timeout)
	}, [words, index, text, deleting, speed, delay, loop])

	return (
		<span role="status" aria-label={`Typing: ${words.join(", ")}`}>
			<span aria-live="polite" aria-atomic="true">
				{text}
			</span>
			<span aria-hidden="true" className="animate-pulse">
				|
			</span>
		</span>
	)
}

export const Typewriter = memo(TypewriterBase)
