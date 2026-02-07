"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type WebSocketStatus = "connecting" | "open" | "closing" | "closed"

export interface WebSocketResult {
	status: WebSocketStatus
	lastMessage: string | null
	send: (data: string) => void
	close: () => void
}

export function useWebSocket(url: string | null): WebSocketResult {
	const [status, setStatus] = useState<WebSocketStatus>("closed")
	const [lastMessage, setLastMessage] = useState<string | null>(null)
	const wsRef = useRef<WebSocket | null>(null)

	const send = useCallback((data: string) => {
		wsRef.current?.send(data)
	}, [])

	const close = useCallback(() => {
		wsRef.current?.close()
	}, [])

	useEffect(() => {
		if (!url) return

		setStatus("connecting")
		const ws = new WebSocket(url)
		wsRef.current = ws

		ws.onopen = () => setStatus("open")
		ws.onclose = () => setStatus("closed")
		ws.onmessage = (e) => setLastMessage(e.data)
		ws.onerror = () => setStatus("closed")

		return () => {
			ws.close()
		}
	}, [url])

	return { status, lastMessage, send, close }
}
