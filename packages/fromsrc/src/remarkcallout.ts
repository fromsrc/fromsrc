import type { Blockquote, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

interface AstNode {
  type: string;
  children?: AstNode[];
  value?: string;
  data?: Record<string, unknown>;
  name?: string;
  attributes?: unknown[];
}

const pattern = /^\[!(\w+)\]\s*/;

const typeMap: Record<string, { name: string; type?: string }> = {
  caution: { name: "Callout", type: "danger" },
  important: { name: "Note", type: "important" },
  note: { name: "Note" },
  tip: { name: "Callout", type: "tip" },
  warning: { name: "Callout", type: "warning" },
};

function extractType(node: Blockquote): string | null {
  const first = node.children[0];
  if (first?.type !== "paragraph") {
    return null;
  }
  const text = (first as AstNode).children?.[0];
  if (text?.type !== "text" || !text.value) {
    return null;
  }
  const match = text.value.match(pattern);
  if (!match) {
    return null;
  }
  const raw = match[1];
  return raw ? raw.toLowerCase() : null;
}

function stripPrefix(node: Blockquote): AstNode[] {
  const children = [...node.children];
  const first = children[0];
  if (first?.type !== "paragraph") {
    return children as AstNode[];
  }
  const para = { ...first, children: [...first.children] };
  const text = para.children[0];
  if (text?.type === "text" && text.value) {
    const stripped = text.value.replace(pattern, "");
    if (stripped) {
      para.children[0] = { ...text, value: stripped };
    } else {
      para.children.shift();
    }
  }
  if (para.children.length === 0) {
    children.shift();
  } else {
    children[0] = para;
  }
  return children as AstNode[];
}

function transformer(tree: Root) {
  visit(tree, "blockquote", (node: Blockquote, index, parent) => {
    if (!parent || index === undefined) {
      return;
    }
    const calloutType = extractType(node);
    if (!calloutType) {
      return;
    }
    const mapping = typeMap[calloutType];
    if (!mapping) {
      return;
    }
    const attrs: unknown[] = [];
    if (mapping.type) {
      attrs.push({
        name: "type",
        type: "mdxJsxAttribute" as const,
        value: mapping.type,
      });
    }
    const element: AstNode = {
      attributes: attrs,
      children: stripPrefix(node),
      data: { _mdxExplicitJsx: true },
      name: mapping.name,
      type: "mdxJsxFlowElement",
    };
    parent.children[index] = element as Root["children"][number];
  });
}

export const remarkCallout: Plugin<[], Root> = () => transformer;
