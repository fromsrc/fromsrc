import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const pattern = /\[\[badge:([^\]:]+)(?::([^\]]+))?\]\]/g;
interface TextNode {
  value: string;
}
interface ParentNode {
  children: unknown[];
}
interface TextPart {
  type: "text";
  value: string;
}
interface BadgePart {
  type: "mdxJsxTextElement";
  name: "Badge";
  attributes: [{ type: "mdxJsxAttribute"; name: "variant"; value: string }];
  children: [TextPart];
  data: { _mdxExplicitJsx: true };
}
type BadgeChild = TextPart | BadgePart;

export const remarkBadge: Plugin<[], Root> = () => (tree) => {
  visit(
    tree,
    "text",
    (
      node: TextNode,
      index: number | undefined,
      parent: ParentNode | undefined
    ) => {
      if (!parent || index === undefined) {
        return;
      }
      const { value } = node;
      pattern.lastIndex = 0;
      if (!pattern.test(value)) {
        return;
      }
      pattern.lastIndex = 0;
      const parts: BadgeChild[] = [];
      let last = 0;

      for (const match of value.matchAll(pattern)) {
        const before = value.slice(last, match.index);
        if (before) {
          parts.push({ type: "text", value: before });
        }

        const text = match[1];
        if (!text) {
          continue;
        }
        const variant = match[2] || "default";

        parts.push({
          attributes: [
            { name: "variant", type: "mdxJsxAttribute", value: variant },
          ],
          children: [{ type: "text", value: text }],
          data: { _mdxExplicitJsx: true },
          name: "Badge",
          type: "mdxJsxTextElement",
        });

        last = match.index! + match[0].length;
      }

      const after = value.slice(last);
      if (after) {
        parts.push({ type: "text", value: after });
      }

      if (parts.length > 0) {
        parent.children.splice(index, 1, ...parts);
      }
    }
  );
};
