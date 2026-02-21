"use client"

import { useCallback, useRef, useState } from "react"

export interface SpeechResult {
	text: string
	listening: boolean
	supported: boolean
	start: () => void
	stop: () => void
}

interface speechalternative {
	transcript: string
}

interface speechresultitem {
	0: speechalternative
}

interface speechresultevent {
	results: ArrayLike<speechresultitem>
}

interface speechinstance {
	lang: string
	continuous: boolean
	interimResults: boolean
	onresult: ((event: speechresultevent) => void) | null
	onend: (() => void) | null
	start: () => void
	stop: () => void
}

type speechctor = new () => speechinstance
type speechwindow = Window & { SpeechRecognition?: speechctor; webkitSpeechRecognition?: speechctor }

export function useSpeechRecognition(lang = "en-US"): SpeechResult {
	const [text, setText] = useState("")
	const [listening, setListening] = useState(false)
	const supported =
		typeof window !== "undefined" &&
		("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
	const recognitionRef = useRef<speechinstance | null>(null)

	const start = useCallback(() => {
		if (!supported) return
		const win = window as speechwindow
		const SR = win.SpeechRecognition || win.webkitSpeechRecognition
		if (!SR) return
		const recognition = new SR()
		recognition.lang = lang
		recognition.continuous = true
		recognition.interimResults = true
		recognition.onresult = (e) => {
			const transcript = Array.from(e.results)
				.map((result) => result[0].transcript)
				.join("")
			setText(transcript)
		}
		recognition.onend = () => setListening(false)
		recognitionRef.current = recognition
		recognition.start()
		setListening(true)
	}, [supported, lang])

	const stop = useCallback(() => {
		recognitionRef.current?.stop()
		setListening(false)
	}, [])

	return { text, listening, supported, start, stop }
}
