"use client"

import type { ReactElement } from "react"
import { useEffect, useState } from "react"

export interface TypewriterProps {
	words: string[]
	speed?: number
	delay?: number
	loop?: boolean
}

const DELETE_SPEED_FACTOR = 0.5

export function Typewriter({
	words,
	speed = 100,
	delay = 2000,
	loop = true,
}: TypewriterProps): ReactElement {
	const [index, setIndex] = useState(0)
	const [text, setText] = useState("")
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		const word = words[index]
		if (!word) return

		if (deleting) {
			if (text === "") {
				setDeleting(false)
				setIndex((i) => (loop ? (i + 1) % words.length : Math.min(i + 1, words.length - 1)))
				return
			}

			const timeout = setTimeout(() => {
				setText((t) => t.slice(0, -1))
			}, speed * DELETE_SPEED_FACTOR)
			return () => clearTimeout(timeout)
		}

		if (text === word) {
			if (!loop && index === words.length - 1) return

			const timeout = setTimeout(() => {
				setDeleting(true)
			}, delay)
			return () => clearTimeout(timeout)
		}

		const timeout = setTimeout(() => {
			setText(word.slice(0, text.length + 1))
		}, speed)
		return () => clearTimeout(timeout)
	}, [words, index, text, deleting, speed, delay, loop])

	return (
		<span>
			<span aria-live="polite" aria-atomic="true">
				{text}
			</span>
			<span aria-hidden="true" className="animate-pulse">
				|
			</span>
		</span>
	)
}
