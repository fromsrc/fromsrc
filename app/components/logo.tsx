export function Logo({ className = "size-5" }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor" />
			<rect x="3" y="11" width="12" height="2" rx="1" fill="currentColor" opacity="0.6" />
			<rect x="3" y="18" width="6" height="2" rx="1" fill="currentColor" opacity="0.3" />
		</svg>
	)
}

export function Bolt({ className = "size-4" }: { className?: string }) {
	return (
		<svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M13 10V3L4 14h7v7l9-11h-7z" />
		</svg>
	)
}
