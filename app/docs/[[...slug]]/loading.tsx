export default function Loading() {
	return (
		<div className="flex w-full max-w-7xl mx-auto">
			<div className="flex-1 min-w-0 py-12 px-8 lg:px-12 animate-pulse">
				<div className="mb-8 pb-6 border-b border-line">
					<div className="h-3 w-24 bg-surface rounded mb-4" />
					<div className="h-6 w-64 bg-surface rounded mb-2" />
					<div className="h-4 w-96 bg-surface rounded" />
				</div>
				<div className="space-y-4">
					<div className="h-4 w-full bg-surface rounded" />
					<div className="h-4 w-5/6 bg-surface rounded" />
					<div className="h-4 w-4/6 bg-surface rounded" />
					<div className="h-20 w-full bg-surface rounded mt-6" />
					<div className="h-4 w-full bg-surface rounded" />
					<div className="h-4 w-3/4 bg-surface rounded" />
				</div>
			</div>
		</div>
	)
}
