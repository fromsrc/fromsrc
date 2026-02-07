"use client"

import { useCallback } from "react"

export default function Error({ reset }: { error: Error; reset: () => void }) {
	const retry = useCallback(() => reset(), [reset])

	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
			<h2 className="text-lg font-medium text-fg">something went wrong</h2>
			<button
				type="button"
				onClick={retry}
				className="text-sm text-muted hover:text-fg transition-colors border border-line rounded-md px-4 py-2"
			>
				retry
			</button>
		</div>
	)
}
