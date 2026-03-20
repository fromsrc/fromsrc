import type { Code, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const pattern = /title=(?:"([^"]+)"|(\S+))/;
interface codechild {
  type: "code";
  value: string;
  lang: string | null;
  meta: string | null;
}
interface titleelement {
  type: "mdxJsxFlowElement";
  name: "CodeBlock";
  attributes: [
    { type: "mdxJsxAttribute"; name: "title"; value: string },
    { type: "mdxJsxAttribute"; name: "lang"; value: string },
  ];
  children: [codechild];
  data: { _mdxExplicitJsx: true };
}

function parse(meta: string): { title: string; cleaned: string } | null {
  const match = meta.match(pattern);
  if (!match) {
    return null;
  }
  const title = match[1] || match[2];
  if (!title) {
    return null;
  }
  const cleaned = meta.replace(pattern, "").trim();
  return { cleaned, title };
}

function transformer(tree: Root) {
  visit(tree, "code", (node: Code, index, parent) => {
    if (!parent || index === undefined || !node.meta) {
      return;
    }
    const result = parse(node.meta);
    if (!result) {
      return;
    }
    const element: titleelement = {
      attributes: [
        {
          name: "title",
          type: "mdxJsxAttribute" as const,
          value: result.title,
        },
        {
          name: "lang",
          type: "mdxJsxAttribute" as const,
          value: node.lang || "",
        },
      ],
      children: [
        {
          lang: node.lang ?? null,
          meta: result.cleaned || null,
          type: "code" as const,
          value: node.value,
        },
      ],
      data: { _mdxExplicitJsx: true },
      name: "CodeBlock",
      type: "mdxJsxFlowElement" as const,
    };
    parent.children[index] = element as Root["children"][number];
  });
}

export const remarkCodeTitle: Plugin<[], Root> = () => transformer;
