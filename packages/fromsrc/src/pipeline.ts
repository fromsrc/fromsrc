/** Context object passed through content pipeline transforms */
export interface PipelineContext {
  path: string;
  content: string;
  frontmatter: Record<string, unknown>;
  meta: Record<string, unknown>;
}

/** Function that transforms pipeline context */
export type Transform = (
  ctx: PipelineContext
) => PipelineContext | Promise<PipelineContext>;

/** Composable content processing pipeline */
export interface Pipeline {
  use(transform: Transform): Pipeline;
  process(ctx: PipelineContext): Promise<PipelineContext>;
  transforms(): Transform[];
}

/** Create a new content processing pipeline with optional initial transforms */
export function createPipeline(...initial: Transform[]): Pipeline {
  const list = [...initial];

  const pipeline: Pipeline = {
    async process(ctx) {
      let result = ctx;
      for (const t of list) {
        result = await t(result);
      }
      return result;
    },
    transforms() {
      return [...list];
    },
    use(transform) {
      list.push(transform);
      return pipeline;
    },
  };

  return pipeline;
}

/** Compose multiple transforms into a single sequential transform */
export function composeTransforms(...transforms: Transform[]): Transform {
  return async (ctx) => {
    let result = ctx;
    for (const t of transforms) {
      result = await t(result);
    }
    return result;
  };
}

/** Create a transform that only runs when a predicate matches */
export function conditionalTransform(
  predicate: (ctx: PipelineContext) => boolean,
  transform: Transform
): Transform {
  return (ctx) => (predicate(ctx) ? transform(ctx) : ctx);
}

/** Create a transform that maps over the content string */
export function mapContent(fn: (content: string) => string): Transform {
  return (ctx) => ({ ...ctx, content: fn(ctx.content) });
}

/** Create a transform that maps over the frontmatter object */
export function mapFrontmatter(
  fn: (fm: Record<string, unknown>) => Record<string, unknown>
): Transform {
  return (ctx) => ({ ...ctx, frontmatter: fn(ctx.frontmatter) });
}
