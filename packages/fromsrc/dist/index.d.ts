import { z } from 'zod';
export { z } from 'zod';

declare const baseSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description?: string | undefined;
    order?: number | undefined;
}, {
    title: string;
    description?: string | undefined;
    order?: number | undefined;
}>;
type InferSchema<T extends z.ZodType> = z.infer<T>;
declare function defineSchema<T extends z.ZodObject<z.ZodRawShape>>(schema: T): T;
declare function extendSchema<T extends z.ZodRawShape>(fields: T): z.ZodObject<z.objectUtil.extendShape<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
}, T>, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<z.objectUtil.extendShape<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
}, T>>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<z.objectUtil.extendShape<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodNumber>;
}, T>> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;

interface DocMeta {
    slug: string;
    title: string;
    description?: string;
    order?: number;
}
interface Doc<T extends Record<string, unknown> = Record<string, unknown>> extends DocMeta {
    content: string;
    data: T;
}
type SchemaType = z.ZodObject<z.ZodRawShape>;
interface ContentConfig<T extends SchemaType = typeof baseSchema> {
    dir: string;
    schema?: T;
}
declare function defineContent<T extends SchemaType>(config: ContentConfig<T>): {
    getDoc: (slug: string[]) => Promise<(z.TypeOf<T> & {
        slug: string;
    } & {
        content: string;
        data: z.infer<T>;
    }) | null>;
    getAllDocs: () => Promise<(z.TypeOf<T> & {
        slug: string;
    })[]>;
    getNavigation: () => Promise<{
        title: string;
        items: (z.TypeOf<T> & {
            slug: string;
        })[];
    }[]>;
    schema: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description?: string | undefined;
        order?: number | undefined;
    }, {
        title: string;
        description?: string | undefined;
        order?: number | undefined;
    }> | T;
};
declare function getDoc(docsDir: string, slug: string[]): Promise<Doc | null>;
declare function getAllDocs(docsDir: string): Promise<DocMeta[]>;
declare function getNavigation(docsDir: string): Promise<{
    title: string;
    items: DocMeta[];
}[]>;

export { type ContentConfig, type Doc, type DocMeta, type InferSchema, baseSchema, defineContent, defineSchema, extendSchema, getAllDocs, getDoc, getNavigation };
