"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type EventSourceStatus = "connecting" | "open" | "closed"

export interface EventSourceResult {
	status: EventSourceStatus
	lastEvent: string | null
	lastData: string | null
	close: () => void
}

export function useEventSource(url: string | null): EventSourceResult {
	const [status, setStatus] = useState<EventSourceStatus>("closed")
	const [lastEvent, setLastEvent] = useState<string | null>(null)
	const [lastData, setLastData] = useState<string | null>(null)
	const sourceRef = useRef<EventSource | null>(null)

	const close = useCallback(() => {
		sourceRef.current?.close()
		setStatus("closed")
	}, [])

	useEffect(() => {
		if (!url) return

		setStatus("connecting")
		const source = new EventSource(url)
		sourceRef.current = source

		source.onopen = () => setStatus("open")
		source.onerror = () => setStatus("closed")
		source.onmessage = (e) => {
			setLastEvent(e.type)
			setLastData(e.data)
		}

		return () => {
			source.close()
		}
	}, [url])

	return { status, lastEvent, lastData, close }
}
