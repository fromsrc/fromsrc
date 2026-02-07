"use client"

import { useCallback, useRef, useState } from "react"

export interface MediaRecorderResult {
	recording: boolean
	blob: Blob | null
	url: string | null
	supported: boolean
	start: (stream: MediaStream) => void
	stop: () => void
}

export function useMediaRecorder(mimeType = "audio/webm"): MediaRecorderResult {
	const [recording, setRecording] = useState(false)
	const [blob, setBlob] = useState<Blob | null>(null)
	const [url, setUrl] = useState<string | null>(null)
	const recorderRef = useRef<MediaRecorder | null>(null)
	const chunksRef = useRef<Blob[]>([])
	const supported = typeof window !== "undefined" && "MediaRecorder" in window

	const start = useCallback(
		(stream: MediaStream) => {
			if (!supported) return
			chunksRef.current = []
			const recorder = new MediaRecorder(stream, { mimeType })
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data)
			}
			recorder.onstop = () => {
				const b = new Blob(chunksRef.current, { type: mimeType })
				setBlob(b)
				setUrl(URL.createObjectURL(b))
				setRecording(false)
			}
			recorderRef.current = recorder
			recorder.start()
			setRecording(true)
		},
		[supported, mimeType],
	)

	const stop = useCallback(() => {
		recorderRef.current?.stop()
	}, [])

	return { recording, blob, url, supported, start, stop }
}
