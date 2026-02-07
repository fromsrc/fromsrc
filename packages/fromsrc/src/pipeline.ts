export type PipelineContext = {
	path: string
	content: string
	frontmatter: Record<string, unknown>
	meta: Record<string, unknown>
}

export type Transform = (ctx: PipelineContext) => PipelineContext | Promise<PipelineContext>

export type Pipeline = {
	use(transform: Transform): Pipeline
	process(ctx: PipelineContext): Promise<PipelineContext>
	transforms(): Transform[]
}

export function createPipeline(...initial: Transform[]): Pipeline {
	const list = [...initial]

	const pipeline: Pipeline = {
		use(transform) {
			list.push(transform)
			return pipeline
		},
		async process(ctx) {
			let result = ctx
			for (const t of list) {
				result = await t(result)
			}
			return result
		},
		transforms() {
			return [...list]
		},
	}

	return pipeline
}

export function composeTransforms(...transforms: Transform[]): Transform {
	return async (ctx) => {
		let result = ctx
		for (const t of transforms) {
			result = await t(result)
		}
		return result
	}
}

export function conditionalTransform(
	predicate: (ctx: PipelineContext) => boolean,
	transform: Transform,
): Transform {
	return (ctx) => (predicate(ctx) ? transform(ctx) : ctx)
}

export function mapContent(fn: (content: string) => string): Transform {
	return (ctx) => ({ ...ctx, content: fn(ctx.content) })
}

export function mapFrontmatter(
	fn: (fm: Record<string, unknown>) => Record<string, unknown>,
): Transform {
	return (ctx) => ({ ...ctx, frontmatter: fn(ctx.frontmatter) })
}
