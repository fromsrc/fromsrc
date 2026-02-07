"use client"

import { useCallback, useRef, useState } from "react"

export interface SpeechResult {
	text: string
	listening: boolean
	supported: boolean
	start: () => void
	stop: () => void
}

export function useSpeechRecognition(lang = "en-US"): SpeechResult {
	const [text, setText] = useState("")
	const [listening, setListening] = useState(false)
	const supported =
		typeof window !== "undefined" &&
		("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
	const recognitionRef = useRef<any>(null)

	const start = useCallback(() => {
		if (!supported) return
		const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
		const recognition = new SR()
		recognition.lang = lang
		recognition.continuous = true
		recognition.interimResults = true
		recognition.onresult = (e: any) => {
			const transcript = Array.from(e.results)
				.map((r: any) => r[0].transcript)
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
