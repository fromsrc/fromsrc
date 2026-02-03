import type { ReactNode } from "react"

interface PropertyProps {
	name: string
	type: string
	required?: boolean
	default?: ReactNode
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
		<div
			role="listitem"
			className={`py-4 border-b border-line last:border-0 ${deprecated ? "opacity-60" : ""}`}
		>
			<dl className="flex flex-wrap items-center gap-2 mb-2">
				<dt className="sr-only">Name</dt>
				<dd className={`text-sm font-mono ${deprecated ? "line-through" : "text-fg"}`}>
					{name}
				</dd>
				<dt className="sr-only">Type</dt>
				<dd className="text-xs px-1.5 py-0.5 rounded bg-surface text-muted font-mono">{type}</dd>
				{required && (
					<>
						<dt className="sr-only">Status</dt>
						<dd className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 uppercase tracking-wider">
							required
						</dd>
					</>
				)}
				{deprecated && (
					<>
						<dt className="sr-only">Status</dt>
						<dd className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase tracking-wider">
							deprecated
						</dd>
					</>
				)}
				{defaultValue !== undefined && (
					<>
						<dt className="sr-only">Default</dt>
						<dd className="text-xs text-muted">
							default: <code className="font-mono">{defaultValue}</code>
						</dd>
					</>
				)}
			</dl>
			{children && (
				<div className="text-sm text-muted" role="note">
					{children}
				</div>
			)}
		</div>
	)
}

interface PropertiesProps {
	children: ReactNode
}

export function Properties({ children }: PropertiesProps) {
	return (
		<div role="list" className="my-6 divide-y divide-line">
			{children}
		</div>
	)
}
