import type { Blockquote, Paragraph, Root, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const types: Record<string, string> = {
  CAUTION: "error",
  IMPORTANT: "info",
  NOTE: "info",
  TIP: "tip",
  WARNING: "warning",
};

const pattern = /^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*/;

function transformer(tree: Root) {
  visit(tree, "blockquote", (node: Blockquote, index, parent) => {
    if (!parent || index === undefined) {
      return;
    }
    const first = node.children[0];
    if (first?.type !== "paragraph") {
      return;
    }

    const text = first.children[0];
    if (text?.type !== "text") {
      return;
    }

    const match = text.value.match(pattern);
    if (!match) {
      return;
    }

    const key = match[1];
    if (!key) {
      return;
    }
    const calloutType = types[key];
    text.value = text.value.replace(pattern, "");

    if (!text.value && first.children.length === 1) {
      node.children.shift();
    } else if (!text.value) {
      first.children.shift();
    }

    const children = node.children.length
      ? node.children
      : [
          {
            children: [{ type: "text" as const, value: "" }],
            type: "paragraph" as const,
          },
        ];

    parent.children[index] = {
      attributes: [
        {
          name: "type",
          type: "mdxJsxAttribute",
          value: calloutType,
        },
      ],
      children,
      data: { _mdxExplicitJsx: true },
      name: "Callout",
      type: "mdxJsxFlowElement",
    } as Root["children"][number];
  });
}

export const remarkAlerts: Plugin<[], Root> = () => transformer;

export default remarkAlerts;
