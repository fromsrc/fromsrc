import type { Image, Paragraph, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

interface FlowElement {
  type: string;
  name: string;
  attributes: { type: string; name: string; value: string }[];
  children: unknown[];
  data?: Record<string, unknown>;
}

function standalone(parent: Paragraph): Image | null {
  if (parent.children.length !== 1) {
    return null;
  }
  const child = parent.children[0];
  if (child?.type !== "image") {
    return null;
  }
  return child as Image;
}

function figure(image: Image): FlowElement {
  const attributes: FlowElement["attributes"] = [
    { name: "src", type: "mdxJsxAttribute", value: image.url },
    { name: "alt", type: "mdxJsxAttribute", value: image.alt || "" },
  ];
  if (image.title) {
    attributes.push({
      name: "title",
      type: "mdxJsxAttribute",
      value: image.title,
    });
  }
  return {
    attributes: [],
    children: [
      {
        attributes,
        children: [],
        name: "img",
        type: "mdxJsxFlowElement",
      },
      {
        attributes: [],
        children: [{ type: "text", value: image.alt || "" }],
        name: "figcaption",
        type: "mdxJsxFlowElement",
      },
    ],
    data: { _mdxExplicitJsx: true },
    name: "figure",
    type: "mdxJsxFlowElement",
  };
}

function transformer(tree: Root) {
  visit(tree, "paragraph", (node: Paragraph, index, parent) => {
    if (!parent || index === undefined) {
      return;
    }
    const image = standalone(node);
    if (!image?.alt) {
      return;
    }
    (parent.children as unknown[])[index] = figure(image);
  });
}

export const remarkCaption: Plugin<[], Root> = () => transformer;
