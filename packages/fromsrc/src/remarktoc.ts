import type { Heading, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

interface Item {
  text: string;
  slug: string;
  depth: number;
}
interface TextNode {
  type: "text";
  value: string;
}
interface MarkerNode {
  type: "paragraph";
  children?: { type: string; value?: string }[];
}
interface ParentNode {
  children: Root["children"];
}
interface MdxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value: string;
}
interface MdxElement {
  type: "mdxJsxFlowElement";
  name: string;
  attributes: MdxAttribute[];
  children: [];
  data: { _mdxExplicitJsx: true };
}

function textContent(node: Heading): string {
  const parts: string[] = [];
  visit(node, "text", (t: TextNode) => {
    parts.push(t.value);
  });
  return parts.join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9-]/g, "");
}

function isTocMarker(node: MarkerNode): boolean {
  if (node.type !== "paragraph") {
    return false;
  }
  if (node.children?.length !== 1) {
    return false;
  }
  const child = node.children[0];
  return child?.type === "text" && child.value?.trim() === "[toc]";
}

export const remarkToc: Plugin<[], Root> = () => (tree) => {
  const items: Item[] = [];

  visit(tree, "heading", (node: Heading) => {
    if (node.depth < 2 || node.depth > 4) {
      return;
    }
    const text = textContent(node);
    if (!text) {
      return;
    }
    items.push({ depth: node.depth, slug: slugify(text), text });
  });

  visit(
    tree,
    "paragraph",
    (node: MarkerNode, index, parent: ParentNode | undefined) => {
      if (!parent || index === undefined) {
        return;
      }
      if (!isTocMarker(node)) {
        return;
      }

      const element: MdxElement = {
        attributes: [
          {
            name: "items",
            type: "mdxJsxAttribute",
            value: JSON.stringify(items),
          },
        ],
        children: [],
        data: { _mdxExplicitJsx: true },
        name: "TableOfContents",
        type: "mdxJsxFlowElement",
      };

      parent.children[index] = element as Root["children"][number];
    }
  );
};
