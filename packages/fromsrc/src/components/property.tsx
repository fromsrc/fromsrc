import { memo, type ReactNode, type JSX } from "react"

/**
 * Props for the Property component that displays a single API property.
 */
export interface PropertyProps {
	name: string
	type: string
	required?: boolean
	default?: ReactNode
	deprecated?: boolean
	children?: ReactNode
}

/**
 * Props for the Properties component that wraps multiple Property items.
 */
export interface PropertiesProps {
	children: ReactNode
}

export const Property = memo(function Property({
	name,
	type,
	required,
	default: defaultValue,
	deprecated,
	children,
}: PropertyProps): JSX.Element {
	return (
		<article
			aria-labelledby={`property-${name}`}
			className={`py-4 border-b border-line last:border-0 ${deprecated ? "opacity-60" : ""}`}
		>
			<header className="flex flex-wrap items-center gap-2 mb-2">
				<h3
					id={`property-${name}`}
					className={`text-sm font-mono ${deprecated ? "line-through" : "text-fg"}`}
				>
					{name}
				</h3>
				<code className="text-xs px-1.5 py-0.5 rounded bg-surface text-muted font-mono">
					{type}
				</code>
				{required && (
					<span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 uppercase tracking-wider">
						required
					</span>
				)}
				{deprecated && (
					<span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase tracking-wider">
						deprecated
					</span>
				)}
				{defaultValue !== undefined && (
					<span className="text-xs text-muted">
						default: <code className="font-mono">{defaultValue}</code>
					</span>
				)}
			</header>
			{children && <p className="text-sm text-muted">{children}</p>}
		</article>
	)
})

export const Properties = memo(function Properties({ children }: PropertiesProps): JSX.Element {
	return (
		<section aria-label="Properties" className="my-6 divide-y divide-line">
			{children}
		</section>
	)
})
