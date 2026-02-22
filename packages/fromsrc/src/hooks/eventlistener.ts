"use client"

import { useEffect } from "react"

type EventTarget = Window | Document | HTMLElement | null

type EventMap<T> = T extends Window
	? WindowEventMap
	: T extends Document
		? DocumentEventMap
		: T extends HTMLElement
			? HTMLElementEventMap
			: never

/**
 * Attaches an event listener to a target element with automatic cleanup
 * @param target - The target to attach the listener to (window, document, or element)
 * @param event - The event type to listen for
 * @param handler - Callback invoked when the event fires
 * @param enabled - Whether the listener is active (default: true)
 * @param options - Optional addEventListener options
 */
export function useEventListener<
	T extends EventTarget,
	K extends Extract<keyof EventMap<NonNullable<T>>, string>,
>(
	target: T,
	event: K,
	handler: (e: EventMap<NonNullable<T>>[K]) => void,
	enabled = true,
	options?: AddEventListenerOptions
): void {
	useEffect(() => {
		if (!enabled || !target) return

		const listener = handler as EventListener
		target.addEventListener(event, listener, options)

		return () => {
			target.removeEventListener(event, listener, options)
		}
	}, [target, event, handler, enabled, options])
}
