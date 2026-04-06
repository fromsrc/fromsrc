import type { Heading, Root } from "mdast";
import type { Plugin } from "unified";
import type { Node } from "unist";
import { visit } from "unist-util-visit";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface TocNode {
  id: string;
  text: string;
  level: number;
  children: TocNode[];
}

function extractText(node: Node): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map(extractText).join("");
  }
  return "";
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^\w\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function buildTocTree(headings: TocHeading[]): TocNode[] {
  const root: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const heading of headings) {
    const node: TocNode = {
      children: [],
      id: heading.id,
      level: heading.level,
      text: heading.text,
    };

    while (stack.length > 0) {
      const last = stack.at(-1);
      if (!last || last.level < heading.level) {
        break;
      }
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack.at(-1);
      if (parent) {
        parent.children.push(node);
      }
    }

    stack.push(node);
  }

  return root;
}

interface FileData {
  data: Record<string, unknown>;
}

function transformer(tree: Root, file: FileData) {
  const headings: TocHeading[] = [];

  visit(tree, "heading", (node: Heading) => {
    const text = extractText(node);
    headings.push({
      id: generateId(text),
      level: node.depth,
      text,
    });
  });

  file.data.headings = headings;
  file.data.toc = buildTocTree(headings);
}

export const remarkStructure: Plugin<[], Root> = () => transformer;
