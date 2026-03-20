import type { Paragraph, Root, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

interface EmbedNode {
  type: string;
  children: never[];
  name: string;
  attributes: { type: "mdxJsxAttribute"; name: string; value: string }[];
  data: { _mdxExplicitJsx: true };
}

interface Provider {
  pattern: RegExp;
  name: string;
  group: number;
}

const providers: Provider[] = [
  {
    group: 1,
    name: "YouTube",
    pattern: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
  },
  {
    group: 1,
    name: "Tweet",
    pattern: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
  },
  {
    group: 1,
    name: "CodeSandbox",
    pattern: /codesandbox\.io\/s\/([\w-]+)/,
  },
  {
    group: 1,
    name: "StackBlitz",
    pattern: /stackblitz\.com\/edit\/([\w-]+)/,
  },
  {
    group: 1,
    name: "Gist",
    pattern: /gist\.github\.com\/[\w-]+\/([\w]+)/,
  },
];

const urlPattern = /^https?:\/\/.+/;

function isUrl(value: string): boolean {
  return urlPattern.test(value.trim());
}

function matchProvider(url: string): EmbedNode | null {
  for (const provider of providers) {
    const match = url.match(provider.pattern);
    if (!match) {
      continue;
    }
    const id = match[provider.group];
    if (!id) {
      continue;
    }
    return {
      attributes: [
        {
          name: "id",
          type: "mdxJsxAttribute",
          value: id,
        },
      ],
      children: [] as never[],
      data: { _mdxExplicitJsx: true },
      name: provider.name,
      type: "mdxJsxFlowElement",
    };
  }
  return null;
}

function transformer(tree: Root) {
  visit(tree, "paragraph", (node: Paragraph, index, parent) => {
    if (!parent || index === undefined) {
      return;
    }
    if (node.children.length !== 1) {
      return;
    }
    const child = node.children[0];
    if (!child) {
      return;
    }
    if (child.type !== "text") {
      return;
    }
    const text = (child as Text).value.trim();
    if (!isUrl(text)) {
      return;
    }
    const embed = matchProvider(text);
    if (!embed) {
      return;
    }
    (parent.children as EmbedNode[])[index] = embed;
  });
}

export const remarkEmbed: Plugin<[], Root> = () => transformer;
