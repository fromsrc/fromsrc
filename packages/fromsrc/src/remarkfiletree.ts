import type { Code, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

interface TreeNode {
  name: string;
  folder: boolean;
  children: TreeNode[];
}

interface mdxattribute {
  type: "mdxJsxAttribute";
  name: string;
  value: string;
}
interface mdxelement {
  type: "mdxJsxFlowElement";
  name: string;
  attributes: mdxattribute[];
  children: mdxelement[];
  data: { _mdxExplicitJsx: true };
}

function attribute(name: string, value: string) {
  return { name, type: "mdxJsxAttribute" as const, value };
}

function parse(content: string): TreeNode[] {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const root: TreeNode[] = [];
  const stack: { depth: number; children: TreeNode[] }[] = [
    { children: root, depth: -1 },
  ];

  for (const line of lines) {
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    const depth = indent === 0 ? 0 : Math.floor(indent / 2);
    const folder = trimmed.endsWith("/");
    const name = folder ? trimmed.slice(0, -1) : trimmed;

    const node: TreeNode = { children: [], folder, name };

    while (stack.length > 1) {
      const last = stack.at(-1);
      if (!last || last.depth < depth) {
        break;
      }
      stack.pop();
    }

    const parent = stack.at(-1);
    if (!parent) {
      continue;
    }
    parent.children.push(node);

    if (folder) {
      stack.push({ children: node.children, depth });
    }
  }

  return root;
}

function toElement(node: TreeNode): mdxelement {
  if (node.folder) {
    return {
      attributes: [attribute("name", node.name)],
      children: node.children.map(toElement),
      data: { _mdxExplicitJsx: true },
      name: "Folder",
      type: "mdxJsxFlowElement",
    };
  }
  return {
    attributes: [attribute("name", node.name)],
    children: [],
    data: { _mdxExplicitJsx: true },
    name: "File",
    type: "mdxJsxFlowElement",
  };
}

function transformer(tree: Root) {
  visit(tree, "code", (node: Code, index, parent) => {
    if (!parent || index === undefined) {
      return;
    }
    const isFiletree =
      node.lang === "filetree" || node.meta?.includes("filetree");
    if (!isFiletree) {
      return;
    }

    const nodes = parse(node.value);
    const element: mdxelement = {
      attributes: [],
      children: nodes.map(toElement),
      data: { _mdxExplicitJsx: true },
      name: "Files",
      type: "mdxJsxFlowElement" as const,
    };

    parent.children[index] = element as Root["children"][number];
  });
}

export const remarkFileTree: Plugin<[], Root> = () => transformer;
