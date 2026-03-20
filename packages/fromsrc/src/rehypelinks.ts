import type { Root, Element } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export interface RehypeLinksOptions {
  icon?: boolean;
  domain?: string;
}

export const rehypeExternalLinks: Plugin<[RehypeLinksOptions?], Root> = (
  options = {}
) => {
  const { icon = false, domain } = options;

  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") {
        return;
      }

      const href = node.properties?.href;
      if (!href || typeof href !== "string") {
        return;
      }

      const isExternal =
        href.startsWith("http://") || href.startsWith("https://");
      if (!isExternal) {
        return;
      }

      if (domain && href.startsWith(domain)) {
        return;
      }

      node.properties = node.properties || {};
      node.properties.target = "_blank";
      node.properties.rel = "noopener noreferrer";

      if (icon) {
        const svg: Element = {
          children: [
            {
              children: [],
              properties: {
                d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              },
              tagName: "path",
              type: "element",
            },
          ],
          properties: {
            ariaHidden: "true",
            fill: "none",
            height: "12",
            stroke: "currentColor",
            strokeWidth: "2",
            style: "display:inline;vertical-align:text-top;margin-left:2px",
            viewBox: "0 0 24 24",
            width: "12",
          },
          tagName: "svg",
          type: "element",
        };
        node.children.push(svg);
      }
    });
  };
};
