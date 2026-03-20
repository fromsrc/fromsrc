import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

function rehypeAnchors() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (!["h2", "h3", "h4"].includes(node.tagName)) {
        return;
      }
      const raw = node.properties?.id;
      const id = typeof raw === "string" ? raw : undefined;
      if (!id) {
        return;
      }

      const link: Element = {
        children: [
          ...node.children,
          {
            children: [{ type: "text", value: "#" }],
            properties: {
              className: ["heading-anchor-icon"],
              ariaHidden: "true",
            },
            tagName: "span",
            type: "element",
          },
        ],
        properties: { className: ["heading-anchor"], href: `#${id}` },
        tagName: "a",
        type: "element",
      };

      node.children = [link];
    });
  };
}

export { rehypeAnchors };
export default rehypeAnchors;
