"use client"

import { type JSX, type ReactNode, memo } from "react"

/**
 * Container for Step components with automatic numbering.
 * Uses CSS counters for step numbers.
 * @property children - Step elements to display
 * @example
 * ```tsx
 * <Steps>
 *   <Step>First step content</Step>
 *   <Step>Second step content</Step>
 * </Steps>
 * ```
 */
export interface StepsProps {
	children: ReactNode
}

export const Steps = memo(function Steps({ children }: StepsProps): JSX.Element {
	return (
		<div className="steps my-6 ml-4 border-l border-line pl-6 [counter-reset:step]">{children}</div>
	)
})

/**
 * Individual step within a Steps container.
 * Automatically numbered via CSS counter.
 * @property children - step content, typically includes h3 heading
 */
export interface StepProps {
	children: ReactNode
}

export const Step = memo(function Step({ children }: StepProps): JSX.Element {
	return (
		<div className="step relative pb-8 last:pb-0 [counter-increment:step]">
			<div className="absolute -left-[34px] flex size-6 items-center justify-center rounded-full border border-line bg-bg text-xs font-medium text-muted before:content-[counter(step)]" />
			<div className="[&>h3]:mt-0 [&>h3]:text-base [&>h3]:font-medium">{children}</div>
		</div>
	)
})
