"use client"

import type { ReactNode } from "react"

export interface StepsProps {
	children: ReactNode
}

export function Steps({ children }: StepsProps) {
	return (
		<div className="steps my-6 ml-4 border-l border-line pl-6 [counter-reset:step]">
			{children}
		</div>
	)
}

export interface StepProps {
	children: ReactNode
}

export function Step({ children }: StepProps) {
	return (
		<div className="step relative pb-8 last:pb-0 [counter-increment:step]">
			<div className="absolute -left-[34px] flex size-6 items-center justify-center rounded-full border border-line bg-bg text-xs font-medium text-muted before:content-[counter(step)]" />
			<div className="[&>h3]:mt-0 [&>h3]:text-base [&>h3]:font-medium">{children}</div>
		</div>
	)
}
