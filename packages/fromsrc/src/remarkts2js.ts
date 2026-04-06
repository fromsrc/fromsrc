import type { Root, Code } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type CodeGroup = Root["children"][number];

function stripTypes(code: string): string {
  let result = code;

  result = result.replaceAll(/import\s+type\s+.*?from\s+['"].*?['"]/g, "");
  result = result.replaceAll(
    /import\s+\{([^}]*)\}\s+from/g,
    (match, imports) => {
      const cleaned = imports
        .split(",")
        .map((imp: string) => imp.trim())
        .filter((imp: string) => !imp.startsWith("type "))
        .map((imp: string) => imp.replace(/^type\s+/, ""))
        .join(", ");
      return cleaned ? `import { ${cleaned} } from` : "";
    }
  );

  result = result.replaceAll(/\binterface\s+\w+\s*\{[^}]*\}/g, "");
  result = result.replaceAll(/\btype\s+\w+\s*=\s*[^;\n]+[;\n]/g, "");
  result = result.replaceAll(/\btype\s+\w+\s*<[^>]+>\s*=\s*[^;\n]+[;\n]/g, "");

  result = result.replaceAll(/<[^>]+>/g, "");

  result = result.replaceAll(
    /:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=\s*[,;=)\]}])/g,
    ""
  );
  result = result.replaceAll(/:\s*\{[^}]*\}/g, "");
  result = result.replaceAll(/:\s*\([^)]*\)\s*=>/g, "");

  result = result.replaceAll(/\bas\s+\w+/g, "");
  result = result.replaceAll("!", "");

  result = result.replaceAll(/\breadonly\s+/g, "");

  result = result.replaceAll(/\.tsx?\b/g, (match) =>
    match === ".tsx" ? ".jsx" : ".js"
  );

  result = result.replaceAll(/\n\s*\n\s*\n+/g, "\n\n");

  return result.trim();
}

function createCodeGroup(
  tsCode: string,
  jsCode: string,
  lang: string
): CodeGroup {
  const jsLang = lang === "tsx" ? "jsx" : "javascript";

  return {
    attributes: [],
    children: [
      {
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "label",
            value: "TypeScript",
          },
        ],
        children: [
          {
            type: "code",
            lang,
            meta: null,
            value: tsCode,
          },
        ],
        name: "CodeTab",
        type: "mdxJsxFlowElement",
      },
      {
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "label",
            value: "JavaScript",
          },
        ],
        children: [
          {
            type: "code",
            lang: jsLang,
            meta: null,
            value: jsCode,
          },
        ],
        name: "CodeTab",
        type: "mdxJsxFlowElement",
      },
    ],
    name: "CodeGroup",
    type: "mdxJsxFlowElement",
  } as CodeGroup;
}

export const remarkTs2Js: Plugin<[], Root> = () => (tree) => {
  visit(tree, "code", (node: Code, index, parent) => {
    if (
      !parent ||
      index === null ||
      index === undefined ||
      typeof index !== "number"
    ) {
      return;
    }

    const { lang } = node;
    if (!lang || !["typescript", "ts", "tsx"].includes(lang)) {
      return;
    }

    if (node.meta?.includes("no-js")) {
      return;
    }

    const jsCode = stripTypes(node.value);

    const codeGroup = createCodeGroup(node.value, jsCode, lang);

    parent.children[index] = codeGroup;
  });
};
