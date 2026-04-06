import type { Paragraph, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const combined = /~~([^~]+)~~|https?:\/\/[^\s<>)}\]]+/g;
type ParagraphChild = Paragraph["children"][number];

function makeDel(content: string): ParagraphChild {
  return {
    attributes: [],
    children: [{ type: "text" as const, value: content }],
    data: { _mdxExplicitJsx: true },
    name: "del",
    type: "mdxJsxTextElement" as const,
  } as ParagraphChild;
}

function makeLink(url: string): ParagraphChild {
  return {
    attributes: [
      { name: "href", type: "mdxJsxAttribute" as const, value: url },
    ],
    children: [{ type: "text" as const, value: url }],
    data: { _mdxExplicitJsx: true },
    name: "a",
    type: "mdxJsxTextElement" as const,
  } as ParagraphChild;
}

function transformer(tree: Root) {
  visit(tree, "paragraph", (node: Paragraph) => {
    const next: ParagraphChild[] = [];
    let changed = false;

    for (const child of node.children) {
      if (child.type !== "text" || !combined.test(child.value)) {
        next.push(child);
        continue;
      }

      changed = true;
      combined.lastIndex = 0;
      let cursor = 0;
      let match: RegExpExecArray | null;

      while ((match = combined.exec(child.value)) !== null) {
        if (match.index > cursor) {
          next.push({
            type: "text",
            value: child.value.slice(cursor, match.index),
          } as ParagraphChild);
        }
        if (match[1] !== undefined) {
          next.push(makeDel(match[1]));
        } else {
          next.push(makeLink(match[0]));
        }
        cursor = match.index + match[0].length;
      }

      if (cursor < child.value.length) {
        next.push({
          type: "text",
          value: child.value.slice(cursor),
        } as ParagraphChild);
      }
    }

    if (changed) {
      node.children = next;
    }
  });
}

export const remarkGfm: Plugin<[], Root> = () => transformer;
