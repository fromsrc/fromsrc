import { memo } from "react"

export interface OpenapiTag {
	name: string
	id: string
	count: number
}

export interface OpenapiTagsProps {
	items: OpenapiTag[]
}

const OpenapiTagsBase = memo(function OpenapiTagsBase({ items }: OpenapiTagsProps) {
	if (items.length < 2) return null
	return (
		<nav aria-label="OpenAPI tags" className="mb-4">
			<ul className="flex flex-wrap gap-2" role="list">
				{items.map((item) => (
					<li key={item.id}>
						<a
							href={`#${item.id}`}
							className="inline-flex items-center gap-2 rounded border border-line px-2 py-1 text-xs text-muted hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dim"
						>
							<span>{item.name}</span>
							<span className="rounded border border-line px-1.5 py-0.5 text-[10px] font-mono">{item.count}</span>
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
})

export const OpenapiTags = OpenapiTagsBase
