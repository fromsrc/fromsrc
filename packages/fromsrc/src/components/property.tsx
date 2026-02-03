import type { ReactNode } from "react"

interface PropertyProps {
	name: string
	type: string
	required?: boolean
	default?: string
	deprecated?: boolean
	children?: ReactNode
}

export function Property({
	name,
	type,
	required,
	default: defaultValue,
	deprecated,
	children,
}: PropertyProps) {
	return (
		<div className={`py-4 border-b border-line last:border-0 ${deprecated ? "opacity-60" : ""}`}>
			<div className="flex flex-wrap items-center gap-2 mb-2">
				<code className={`text-sm font-mono ${deprecated ? "line-through" : "text-fg"}`}>
					{name}
				</code>
				<span className="text-xs px-1.5 py-0.5 rounded bg-surface text-muted font-mono">
					{type}
				</span>
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
			</div>
			{children && <div className="text-sm text-muted">{children}</div>}
		</div>
	)
}

interface PropertiesProps {
	children: ReactNode
}

export function Properties({ children }: PropertiesProps) {
	return <div className="my-6 divide-y divide-line">{children}</div>
}
