import type { Code, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

function attribute(name: string, value: string) {
  return { name, type: "mdxJsxAttribute", value };
}

type CodeNode = Code;
interface TabElement {
  type: "mdxJsxFlowElement";
  name: "CodeTab";
  attributes: ReturnType<typeof attribute>[];
  children: [CodeNode];
  data: { _mdxExplicitJsx: true };
}
interface GroupElement {
  type: "mdxJsxFlowElement";
  name: "CodeGroup";
  attributes: [];
  children: TabElement[];
  data: { _mdxExplicitJsx: true };
}

function skipped(node: Code): boolean {
  return (
    !!node.meta &&
    (node.meta.includes("nogroup") || node.meta.includes("standalone"))
  );
}

function transformer(tree: Root) {
  visit(tree, "code", (_node: Code, index, parent) => {
    if (!parent || index === undefined) {
      return;
    }
    if (skipped(_node)) {
      return;
    }

    const group: Code[] = [_node];
    let next = index + 1;

    while (next < parent.children.length) {
      const sibling = parent.children[next];
      if (sibling?.type !== "code") {
        break;
      }
      if (skipped(sibling as Code)) {
        break;
      }
      group.push(sibling as Code);
      next++;
    }

    if (group.length < 2) {
      return;
    }

    const tabs: TabElement[] = group.map((code) => ({
      attributes: [
        attribute("label", code.lang ?? "text"),
        attribute("value", code.lang ?? "text"),
      ],
      children: [code],
      data: { _mdxExplicitJsx: true },
      name: "CodeTab",
      type: "mdxJsxFlowElement",
    }));

    const element: GroupElement = {
      attributes: [],
      children: tabs,
      data: { _mdxExplicitJsx: true },
      name: "CodeGroup",
      type: "mdxJsxFlowElement",
    };

    parent.children.splice(
      index,
      group.length,
      element as Root["children"][number]
    );
  });
}

export const remarkTabs: Plugin<[], Root> = () => transformer;
