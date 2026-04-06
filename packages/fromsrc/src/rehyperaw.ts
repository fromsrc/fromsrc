import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

interface TextNode {
  type: "text";
  value: string;
}
interface ParentNode {
  children?: unknown[];
}

function isText(node: unknown): node is TextNode {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as TextNode).type === "text"
  );
}

function extractText(node: unknown): string {
  if (isText(node)) {
    return node.value;
  }
  if (
    typeof node === "object" &&
    node !== null &&
    Array.isArray((node as ParentNode).children)
  ) {
    return (node as ParentNode).children?.map(extractText).join("") ?? "";
  }
  return "";
}

function transformer(tree: Root) {
  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "pre") {
      return;
    }
    const code = node.children.find(
      (c): c is Element => c.type === "element" && c.tagName === "code"
    );
    if (!code) {
      return;
    }
    const raw = extractText(code).replace(/\n$/, "");
    node.properties ??= {};
    node.properties["data-raw"] = raw;
  });
}

const rehypeRaw: Plugin<[], Root> = () => transformer;

export { rehypeRaw };
