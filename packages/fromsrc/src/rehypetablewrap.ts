import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export interface TableWrapOptions {
  className?: string;
}

export const rehypeTableWrap: Plugin<[TableWrapOptions?], Root> = (options) => {
  const className = options?.className ?? "overflow-x-auto";

  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table") {
        return;
      }
      if (!parent || index === undefined) {
        return;
      }

      const wrapper: Element = {
        children: [node],
        properties: {
          className: [className],
          role: "region",
          tabIndex: 0,
        },
        tagName: "div",
        type: "element",
      };

      parent.children[index] = wrapper;
    });
  };
};
