"use client";
"use client";

// src/components/content.tsx
import { useEffect, useState as useState4 } from "react";

// src/components/codeblock.tsx
import { useState, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var icons = {
  typescript: "M0 12v12h24V0H0v12zm19.3-.5c.5.5.8 1 1 1.7.1.3.1.9.1 1.5v3.2h-1.6v-3c0-.7 0-1.2-.1-1.5-.1-.5-.4-.8-.8-1-.2-.1-.5-.2-.8-.2s-.6 0-.9.2c-.4.2-.7.5-.8 1-.1.3-.2.8-.2 1.5v3h-1.6v-6.8h1.5v1c.2-.4.5-.7.8-.9.4-.2.8-.3 1.3-.3.6 0 1.1.2 1.6.5.1.1.3.2.5.3zm-8.2-2.6v1.8h1.8v1.3h-1.8v3.3c0 .4 0 .6.1.7.1.2.3.3.6.3h.5v1.4h-.9c-.7 0-1.2-.2-1.4-.5-.2-.2-.3-.6-.3-1.2v-4h-1.3V11h1.3V9.2l1.6-.5V11h-.2z",
  javascript: "M0 0h24v24H0V0zm22 20.2l-1.6-1c-.2-.2-.5-.6-.7-1l-1.5.9c.4.7.9 1.3 1.6 1.7.6.4 1.4.6 2.2.6.9 0 1.6-.2 2.2-.7.6-.5.8-1.1.8-1.9 0-.7-.2-1.3-.7-1.7-.4-.4-1-.7-1.9-1-.7-.2-1.1-.4-1.4-.6-.2-.2-.3-.4-.3-.7s.1-.5.3-.7.5-.3.9-.3c.7 0 1.3.3 1.7 1l1.5-1c-.7-1.2-1.8-1.7-3.2-1.7-.9 0-1.6.2-2.2.7-.6.5-.9 1.1-.9 1.9 0 1.2.8 2.1 2.3 2.6.9.3 1.4.5 1.6.7.2.2.3.4.3.7s-.1.5-.4.7c-.3.2-.6.3-1.1.3-.9 0-1.6-.4-2-1.2zM8 13.2c-.1.4-.4.8-.6 1l-1.5-.9c.3-.4.5-.9.6-1.3.1-.5.2-1.2.2-2.3V5h1.9v4.7c0 1.4-.1 2.4-.4 3.2-.1.1-.1.2-.2.3z",
  jsx: "M7.5 12L3 18h3l3-4.5L12 18h3l-4.5-6L15 6h-3l-3 4.5L6 6H3l4.5 6z",
  tsx: "M7.5 12L3 18h3l3-4.5L12 18h3l-4.5-6L15 6h-3l-3 4.5L6 6H3l4.5 6z",
  python: "M12 0C5.5 0 5.9 2.6 5.9 2.6l.1 2.7h6.2v.8H3.9S0 5.7 0 12c0 6.3 3.4 6.1 3.4 6.1h2V15s-.1-3.4 3.4-3.4h5.8s3.2.1 3.2-3.1V3.1S18.3 0 12 0zM8.8 1.8c.6 0 1 .5 1 1s-.5 1-1 1-1-.5-1-1 .5-1 1-1z",
  rust: "M23.8 12l-1.2-.7.3-.4c.1-.2.1-.5-.1-.7l-.6-.6.2-.5c.1-.3 0-.5-.2-.7l-.7-.5.1-.5c0-.3-.1-.5-.3-.6l-.8-.4v-.5c0-.3-.2-.5-.4-.6l-.9-.2-.1-.5c-.1-.3-.3-.5-.6-.5l-.9-.1-.2-.5c-.1-.2-.4-.4-.6-.4h-1l-.3-.4c-.2-.2-.5-.3-.7-.2l-1 .1-.4-.3c-.2-.2-.5-.2-.7-.1l-1 .3-.4-.2c-.3-.1-.5 0-.7.1l-.9.5-.5-.1c-.3-.1-.5 0-.7.2l-.8.6-.5-.1c-.3 0-.5.1-.7.3l-.6.7-.5.1c-.3.1-.5.3-.5.5l-.4.9-.4.2c-.3.1-.4.3-.4.6l-.2 1-.4.3c-.2.2-.3.4-.2.7l.1 1-.3.4c-.2.2-.2.5-.1.7l.3 1-.2.5c-.1.2 0 .5.1.7l.5.9-.1.5c0 .3.1.5.3.7l.6.8v.5c.1.3.3.5.5.5l.8.5.1.5c.1.3.3.5.6.5l.9.3.2.5c.2.2.4.4.7.3l1 .1.3.4c.2.2.5.3.7.2l1-.2.4.3c.2.2.5.2.7.1l1-.4.5.2c.3.1.5 0 .7-.2l.8-.6.5.1c.3 0 .5-.2.7-.4l.6-.8.5-.1c.3-.1.5-.3.5-.6l.3-.9.4-.2c.3-.1.4-.4.4-.7l.1-1 .4-.3c.2-.2.3-.5.1-.7l-.2-1 .3-.4c.1-.3.1-.5-.1-.7l-.4-.9.2-.5zM12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z",
  go: "M1.8 8.4c-.1 0-.1 0-.2-.1 0 0 0-.1.1-.2l.6-.5h2.1l.6.5c.1 0 .1.1 0 .2l-.1.1H1.8zm-.8 1.3c-.1 0-.2 0-.2-.1 0 0 0-.1.1-.2l.6-.5h3.4l.5.5c.1.1.1.1 0 .2 0 0-.1.1-.2.1H1zm2.5 1.3c-.1 0-.1 0-.2-.1 0-.1 0-.1.1-.2l.4-.5h2l.6.5c.1.1.1.1.1.2l-.2.1H3.5zm15.1-.9c-.6 1.4-2 2.4-3.6 2.4-1.3 0-2.5-.6-3.2-1.6-.7.9-1.8 1.5-3.1 1.5-2.2 0-4-1.8-4-4s1.8-4 4-4c1.3 0 2.4.6 3.1 1.5.8-1 2-1.6 3.3-1.6 2.2 0 4 1.8 4 4 0 .6-.2 1.2-.4 1.8h-.1z",
  bash: "M4 20h4v-4H4v4zm6-16v4h4V4h-4zm0 12h4v-4h-4v4zm6-12v4h4V4h-4zm0 12h4v-4h-4v4zM4 4h4v4H4V4zm0 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z",
  shell: "M4 20h4v-4H4v4zm6-16v4h4V4h-4zm0 12h4v-4h-4v4zm6-12v4h4V4h-4zm0 12h4v-4h-4v4zM4 4h4v4H4V4zm0 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z",
  json: "M5 3h2v2H5v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5h2v2H5c-1.1 0-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z",
  css: "M1.5 0h21l-1.9 21.6L12 24l-8.6-2.4L1.5 0zm17.1 4.4H5.4l.3 3.4h12.6l-.9 9.8-5.4 1.5-5.4-1.5-.4-4h3.3l.2 2 2.3.6 2.3-.6.3-2.8H5.9l-.8-9.2h13.8l-.3 3.4z",
  html: "M1.5 0h21l-1.9 21.6L12 24l-8.6-2.4L1.5 0zM20 4H4l.7 7.3h11.4l-.4 4-3.7 1-3.7-1-.2-2.7H5l.5 5.4 6.5 1.8 6.5-1.8.8-9H7.6l-.3-3h13.4L20 4z",
  yaml: "M2.6 6l3.8 5.6v6.4h2.7v-6.4L12.9 6h-3l-2 3.8L5.6 6H2.6zm9.9 12h9.5v-2.5h-6.8v-2.3h5.5V11h-5.5V8.5h6.8V6h-9.5v12z",
  markdown: "M2 4v16h20V4H2zm3 12v-5.5L7.5 13 10 10.5V16h2v-8h-2l-2.5 3L5 8H3v8h2zm11-1.5L13 11h2V8h3v3h2l-3 3.5z",
  md: "M2 4v16h20V4H2zm3 12v-5.5L7.5 13 10 10.5V16h2v-8h-2l-2.5 3L5 8H3v8h2zm11-1.5L13 11h2V8h3v3h2l-3 3.5z"
};
var aliases = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  zsh: "bash",
  yml: "yaml"
};
function LanguageIcon({ lang }) {
  const normalized = aliases[lang] || lang;
  const path = icons[normalized];
  if (!path) return null;
  return /* @__PURE__ */ jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      style: { width: 14, height: 14, flexShrink: 0 },
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx("path", { d: path })
    }
  );
}
function CopyButton({ codeRef }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const code = codeRef.current?.textContent || "";
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: copy,
      "aria-label": copied ? "Copied" : "Copy code",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px",
        color: copied ? "#22c55e" : "#737373",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        transition: "color 0.15s",
        borderRadius: "4px"
      },
      onMouseEnter: (e) => !copied && (e.currentTarget.style.color = "#fafafa"),
      onMouseLeave: (e) => !copied && (e.currentTarget.style.color = "#737373"),
      children: copied ? /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: 14, height: 14 }, "aria-hidden": "true", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }) : /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: 14, height: 14 }, "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
        /* @__PURE__ */ jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
      ] })
    }
  );
}
function CodeBlock({ children, lang, title }) {
  const codeRef = useRef(null);
  const label = title || lang;
  return /* @__PURE__ */ jsxs(
    "figure",
    {
      style: {
        position: "relative",
        margin: "24px 0",
        borderRadius: "8px",
        backgroundColor: "#0d0d0d",
        border: "1px solid #1c1c1c",
        overflow: "hidden"
      },
      children: [
        label && /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              height: "36px",
              borderBottom: "1px solid #1c1c1c"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                lang && /* @__PURE__ */ jsx(LanguageIcon, { lang }),
                /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#737373" }, children: label })
              ] }),
              /* @__PURE__ */ jsx(CopyButton, { codeRef })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: codeRef,
            style: {
              padding: "14px 16px",
              overflow: "auto",
              fontSize: "13px",
              lineHeight: "1.6",
              maxHeight: "500px"
            },
            children
          }
        ),
        !label && /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: "8px", right: "8px" }, children: /* @__PURE__ */ jsx(CopyButton, { codeRef }) })
      ]
    }
  );
}

// src/components/install.tsx
import { useState as useState2 } from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var managers = ["npm", "pnpm", "yarn", "bun"];
var commands = {
  npm: "npm i",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add"
};
function CopyButton2({ text }) {
  const [copied, setCopied] = useState2(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return /* @__PURE__ */ jsx2(
    "button",
    {
      type: "button",
      onClick: copy,
      "aria-label": copied ? "Copied" : "Copy code",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px",
        color: copied ? "#22c55e" : "#737373",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        transition: "color 0.15s"
      },
      onMouseEnter: (e) => !copied && (e.currentTarget.style.color = "#fafafa"),
      onMouseLeave: (e) => !copied && (e.currentTarget.style.color = "#737373"),
      children: copied ? /* @__PURE__ */ jsx2("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: 14, height: 14 }, "aria-hidden": "true", children: /* @__PURE__ */ jsx2("polyline", { points: "20 6 9 17 4 12" }) }) : /* @__PURE__ */ jsxs2("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: 14, height: 14 }, "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx2("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
        /* @__PURE__ */ jsx2("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
      ] })
    }
  );
}
function Install({ package: pkg2 }) {
  const [active, setActive] = useState2("npm");
  const command = `${commands[active]} ${pkg2}`;
  return /* @__PURE__ */ jsxs2(
    "figure",
    {
      style: {
        position: "relative",
        margin: "24px 0",
        borderRadius: "8px",
        backgroundColor: "#0d0d0d",
        border: "1px solid #1c1c1c",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ jsxs2(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              height: "40px",
              borderBottom: "1px solid #1c1c1c"
            },
            children: [
              /* @__PURE__ */ jsx2("div", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: managers.map((m) => /* @__PURE__ */ jsx2(
                "button",
                {
                  type: "button",
                  onClick: () => setActive(m),
                  style: {
                    padding: "4px 10px",
                    fontSize: "13px",
                    color: active === m ? "#fafafa" : "#737373",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: active === m ? "2px solid #fafafa" : "2px solid transparent",
                    marginBottom: "-1px",
                    transition: "color 0.15s"
                  },
                  children: m
                },
                m
              )) }),
              /* @__PURE__ */ jsx2(CopyButton2, { text: command })
            ]
          }
        ),
        /* @__PURE__ */ jsxs2(
          "div",
          {
            style: {
              padding: "14px 16px",
              fontSize: "13px",
              lineHeight: "1.6",
              fontFamily: "var(--font-mono), ui-monospace, monospace"
            },
            children: [
              /* @__PURE__ */ jsx2("span", { style: { color: "#7ee787" }, children: commands[active] }),
              /* @__PURE__ */ jsxs2("span", { style: { color: "#fafafa" }, children: [
                " ",
                pkg2
              ] })
            ]
          }
        )
      ]
    }
  );
}

// src/components/create.tsx
import { useState as useState3 } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var managers2 = ["npm", "pnpm", "yarn", "bun"];
var commands2 = {
  npm: "npm create",
  pnpm: "pnpm create",
  yarn: "yarn create",
  bun: "bun create"
};
var pkg = "fromsrc";
function CopyButton3({ text }) {
  const [copied, setCopied] = useState3(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return /* @__PURE__ */ jsx3(
    "button",
    {
      type: "button",
      onClick: copy,
      "aria-label": copied ? "Copied" : "Copy code",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px",
        color: copied ? "#22c55e" : "#737373",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        transition: "color 0.15s"
      },
      onMouseEnter: (e) => !copied && (e.currentTarget.style.color = "#fafafa"),
      onMouseLeave: (e) => !copied && (e.currentTarget.style.color = "#737373"),
      children: copied ? /* @__PURE__ */ jsx3("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: 14, height: 14 }, "aria-hidden": "true", children: /* @__PURE__ */ jsx3("polyline", { points: "20 6 9 17 4 12" }) }) : /* @__PURE__ */ jsxs3("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: 14, height: 14 }, "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx3("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
        /* @__PURE__ */ jsx3("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
      ] })
    }
  );
}
function Create() {
  const [active, setActive] = useState3("npm");
  const command = `${commands2[active]} ${pkg}`;
  return /* @__PURE__ */ jsxs3(
    "figure",
    {
      style: {
        position: "relative",
        margin: "24px 0",
        borderRadius: "8px",
        backgroundColor: "#0d0d0d",
        border: "1px solid #1c1c1c",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ jsxs3(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              height: "40px",
              borderBottom: "1px solid #1c1c1c"
            },
            children: [
              /* @__PURE__ */ jsx3("div", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: managers2.map((m) => /* @__PURE__ */ jsx3(
                "button",
                {
                  type: "button",
                  onClick: () => setActive(m),
                  style: {
                    padding: "4px 10px",
                    fontSize: "13px",
                    color: active === m ? "#fafafa" : "#737373",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: active === m ? "2px solid #fafafa" : "2px solid transparent",
                    marginBottom: "-1px",
                    transition: "color 0.15s"
                  },
                  children: m
                },
                m
              )) }),
              /* @__PURE__ */ jsx3(CopyButton3, { text: command })
            ]
          }
        ),
        /* @__PURE__ */ jsxs3(
          "div",
          {
            style: {
              padding: "14px 16px",
              fontSize: "13px",
              lineHeight: "1.6",
              fontFamily: "var(--font-mono), ui-monospace, monospace"
            },
            children: [
              /* @__PURE__ */ jsx3("span", { style: { color: "#7ee787" }, children: commands2[active] }),
              /* @__PURE__ */ jsxs3("span", { style: { color: "#fafafa" }, children: [
                " ",
                pkg
              ] })
            ]
          }
        )
      ]
    }
  );
}

// src/components/content.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function getId(children) {
  if (typeof children === "string") {
    return children.toLowerCase().replace(/\s+/g, "-");
  }
  return "";
}
var components = {
  h1: (props) => /* @__PURE__ */ jsx4("h1", { className: "text-2xl font-medium mt-12 mb-4 first:mt-0 text-fg", ...props }),
  h2: (props) => /* @__PURE__ */ jsx4(
    "h2",
    {
      id: getId(props.children),
      className: "text-lg font-medium mt-10 mb-4 pb-2 border-b border-line scroll-mt-20 text-fg",
      ...props
    }
  ),
  h3: (props) => /* @__PURE__ */ jsx4(
    "h3",
    {
      id: getId(props.children),
      className: "text-base font-medium mt-8 mb-3 scroll-mt-20 text-fg",
      ...props
    }
  ),
  p: (props) => /* @__PURE__ */ jsx4("p", { className: "mb-4 text-muted leading-7", ...props }),
  a: (props) => /* @__PURE__ */ jsx4(
    "a",
    {
      className: "text-fg underline decoration-line underline-offset-4 hover:decoration-fg transition-colors",
      ...props
    }
  ),
  ul: (props) => /* @__PURE__ */ jsx4("ul", { className: "my-4 space-y-2 text-muted", ...props }),
  ol: (props) => /* @__PURE__ */ jsx4("ol", { className: "my-4 space-y-2 text-muted list-decimal list-inside", ...props }),
  li: (props) => /* @__PURE__ */ jsxs4("li", { className: "flex gap-2", children: [
    /* @__PURE__ */ jsx4("span", { className: "text-dim select-none", children: "\u2022" }),
    /* @__PURE__ */ jsx4("span", { children: props.children })
  ] }),
  strong: (props) => /* @__PURE__ */ jsx4("strong", { className: "font-medium text-fg", ...props }),
  code: (props) => {
    const text = typeof props.children === "string" ? props.children : "";
    const isInline = typeof props.children === "string" && !text.includes("\n");
    if (!isInline) {
      return /* @__PURE__ */ jsx4("code", { ...props });
    }
    return /* @__PURE__ */ jsx4(
      "code",
      {
        style: {
          padding: "2px 6px",
          backgroundColor: "#141414",
          border: "1px solid #1c1c1c",
          borderRadius: "4px",
          fontSize: "12px",
          fontFamily: "var(--font-mono), ui-monospace, monospace"
        },
        ...props
      }
    );
  },
  pre: (props) => {
    const lang = props["data-language"] || "";
    return /* @__PURE__ */ jsx4(CodeBlock, { lang, children: /* @__PURE__ */ jsx4(
      "pre",
      {
        ...props,
        style: {
          margin: 0,
          padding: 0,
          background: "transparent",
          fontFamily: "var(--font-mono), ui-monospace, monospace"
        }
      }
    ) });
  },
  blockquote: (props) => /* @__PURE__ */ jsx4("blockquote", { className: "my-6 pl-4 border-l-2 border-line text-muted italic", ...props }),
  hr: () => /* @__PURE__ */ jsx4("hr", { className: "border-line my-12" }),
  table: (props) => /* @__PURE__ */ jsx4("div", { className: "my-6 overflow-x-auto rounded-xl border border-line", children: /* @__PURE__ */ jsx4("table", { className: "w-full text-sm", ...props }) }),
  thead: (props) => /* @__PURE__ */ jsx4("thead", { className: "bg-surface", ...props }),
  th: (props) => /* @__PURE__ */ jsx4("th", { className: "text-left px-4 py-3 font-medium text-fg border-b border-line", ...props }),
  td: (props) => /* @__PURE__ */ jsx4("td", { className: "px-4 py-3 border-b border-line/50 text-muted", ...props }),
  tr: (props) => /* @__PURE__ */ jsx4("tr", { className: "hover:bg-surface/50 transition-colors", ...props }),
  Install,
  Create
};
function Content({ source }) {
  const [Content2, setContent] = useState4(null);
  useEffect(() => {
    async function load() {
      const { compile, run } = await import("@mdx-js/mdx");
      const { default: remarkGfm } = await import("remark-gfm");
      const { default: rehypeShiki } = await import("@shikijs/rehype");
      const {
        transformerNotationHighlight,
        transformerNotationDiff,
        transformerNotationFocus
      } = await import("@shikijs/transformers");
      const runtime = await import("react/jsx-runtime");
      const code = await compile(source, {
        outputFormat: "function-body",
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              theme: "github-dark-default",
              defaultColor: false,
              transformers: [
                transformerNotationHighlight(),
                transformerNotationDiff(),
                transformerNotationFocus(),
                {
                  pre(node) {
                    const lang = this.options.lang || "";
                    if (lang) {
                      node.properties["data-language"] = lang;
                    }
                  }
                }
              ]
            }
          ]
        ]
      });
      const module = await run(String(code), {
        ...runtime,
        baseUrl: import.meta.url
      });
      setContent(
        () => module.default
      );
    }
    load();
  }, [source]);
  if (!Content2) {
    return /* @__PURE__ */ jsxs4("div", { className: "space-y-4 animate-pulse", children: [
      /* @__PURE__ */ jsx4("div", { className: "h-6 bg-surface rounded w-1/3" }),
      /* @__PURE__ */ jsx4("div", { className: "h-4 bg-surface/50 rounded w-full" }),
      /* @__PURE__ */ jsx4("div", { className: "h-4 bg-surface/50 rounded w-5/6" }),
      /* @__PURE__ */ jsx4("div", { className: "h-4 bg-surface/50 rounded w-4/6" }),
      /* @__PURE__ */ jsx4("div", { className: "h-32 bg-surface/30 rounded mt-6" })
    ] });
  }
  return /* @__PURE__ */ jsx4(Content2, { components });
}

// src/components/sidebar.tsx
import Link2 from "next/link";

// src/components/navlink.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return /* @__PURE__ */ jsxs5(
    Link,
    {
      href,
      className: `flex items-center gap-2 px-2 py-1.5 text-xs rounded-md border transition-colors ${isActive ? "text-fg bg-surface border-line" : "text-muted hover:text-fg hover:bg-surface/50 border-transparent"}`,
      children: [
        isActive && /* @__PURE__ */ jsx5("span", { className: "w-1 h-1 rounded-full bg-accent" }),
        children
      ]
    }
  );
}

// src/components/search.tsx
import { useState as useState5, useEffect as useEffect2, useRef as useRef3 } from "react";
import { useRouter } from "next/navigation";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function Search({ basePath = "/docs", docs }) {
  const [open, setOpen] = useState5(false);
  const [query, setQuery] = useState5("");
  const [selected, setSelected] = useState5(0);
  const inputRef = useRef3(null);
  const router = useRouter();
  useEffect2(() => {
    const handleKeyDown2 = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown2);
    return () => window.removeEventListener("keydown", handleKeyDown2);
  }, []);
  useEffect2(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setSelected(0);
    }
  }, [open]);
  const filtered = docs.filter(
    (r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.description?.toLowerCase().includes(query.toLowerCase())
  );
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    }
    if (e.key === "Enter" && filtered[selected]) {
      router.push(filtered[selected].slug ? `${basePath}/${filtered[selected].slug}` : basePath);
      setOpen(false);
    }
  };
  if (!open) {
    return /* @__PURE__ */ jsxs6(
      "button",
      {
        type: "button",
        onClick: () => setOpen(true),
        className: "flex items-center gap-2 w-full px-3 py-2 text-xs text-muted bg-surface border border-line rounded-lg hover:border-dim transition-colors",
        children: [
          /* @__PURE__ */ jsx6(
            "svg",
            {
              className: "w-3.5 h-3.5",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              "aria-hidden": "true",
              children: /* @__PURE__ */ jsx6(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx6("span", { className: "flex-1 text-left", children: "search" }),
          /* @__PURE__ */ jsx6("kbd", { className: "px-1.5 py-0.5 text-[10px] bg-bg border border-line rounded", children: "\u2318K" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs6("div", { className: "fixed inset-0 z-50", children: [
    /* @__PURE__ */ jsx6(
      "div",
      {
        className: "absolute inset-0 bg-bg/80 backdrop-blur-sm",
        onClick: () => setOpen(false),
        onKeyDown: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx6("div", { className: "relative max-w-lg mx-auto mt-[20vh]", children: /* @__PURE__ */ jsxs6("div", { className: "bg-surface border border-line rounded-xl shadow-2xl overflow-hidden", children: [
      /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-3 px-4 border-b border-line", children: [
        /* @__PURE__ */ jsx6(
          "svg",
          {
            className: "w-4 h-4 text-muted",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            children: /* @__PURE__ */ jsx6(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              }
            )
          }
        ),
        /* @__PURE__ */ jsx6(
          "input",
          {
            ref: inputRef,
            type: "text",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: "search documentation...",
            className: "flex-1 py-4 bg-transparent text-fg text-sm placeholder:text-muted focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsx6("kbd", { className: "px-1.5 py-0.5 text-[10px] text-muted bg-bg border border-line rounded", children: "esc" })
      ] }),
      /* @__PURE__ */ jsx6("div", { className: "max-h-80 overflow-y-auto", children: filtered.length === 0 ? /* @__PURE__ */ jsx6("div", { className: "p-8 text-center text-muted text-sm", children: "no results" }) : /* @__PURE__ */ jsx6("ul", { className: "p-2", children: filtered.map((result, i) => /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsxs6(
        "button",
        {
          type: "button",
          onClick: () => {
            router.push(result.slug ? `${basePath}/${result.slug}` : basePath);
            setOpen(false);
          },
          className: `w-full text-left px-3 py-2 rounded-lg transition-colors ${i === selected ? "bg-bg border border-line text-fg" : "text-muted hover:bg-bg/50"}`,
          children: [
            /* @__PURE__ */ jsx6("div", { className: "text-sm", children: result.title }),
            result.description && /* @__PURE__ */ jsx6("div", { className: "text-xs text-dim truncate", children: result.description })
          ]
        }
      ) }, result.slug)) }) })
    ] }) })
  ] });
}

// src/components/sidebar.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function Sidebar({ title, logo, navigation, docs, basePath = "/docs", github }) {
  return /* @__PURE__ */ jsxs7("aside", { className: "w-60 shrink-0 border-r border-line h-screen sticky top-0 overflow-y-auto bg-bg", children: [
    /* @__PURE__ */ jsx7("div", { className: "p-5", children: /* @__PURE__ */ jsxs7(Link2, { href: "/", className: "flex items-center gap-2.5 text-sm text-fg hover:text-accent transition-colors", children: [
      /* @__PURE__ */ jsx7("div", { className: "p-1.5 rounded-lg bg-surface border border-line", children: logo }),
      title
    ] }) }),
    /* @__PURE__ */ jsx7("div", { className: "px-4 mb-6", children: /* @__PURE__ */ jsx7(Search, { basePath, docs }) }),
    /* @__PURE__ */ jsx7("nav", { className: "px-4 pb-20", children: navigation.map((section) => /* @__PURE__ */ jsxs7("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx7("h3", { className: "px-2 mb-2 text-[11px] text-muted uppercase tracking-wider", children: section.title }),
      /* @__PURE__ */ jsx7("ul", { className: "space-y-0.5", children: section.items.map((item) => /* @__PURE__ */ jsx7("li", { children: /* @__PURE__ */ jsx7(NavLink, { href: item.slug ? `${basePath}/${item.slug}` : basePath, children: item.title }) }, item.slug)) })
    ] }, section.title)) }),
    github && /* @__PURE__ */ jsx7("div", { className: "absolute bottom-0 left-0 right-0 p-4 border-t border-line bg-bg", children: /* @__PURE__ */ jsxs7(
      "a",
      {
        href: github,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "flex items-center gap-2 text-xs text-muted hover:text-fg transition-colors",
        children: [
          /* @__PURE__ */ jsx7("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx7(
            "path",
            {
              fillRule: "evenodd",
              d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
              clipRule: "evenodd"
            }
          ) }),
          "github"
        ]
      }
    ) })
  ] });
}

// src/components/toc/hook.ts
import { useEffect as useEffect3, useState as useState6 } from "react";
function useToc(multi = false) {
  const [headings, setHeadings] = useState6([]);
  const [active, setActive] = useState6("");
  const [activeRange, setActiveRange] = useState6([]);
  useEffect3(() => {
    function scan() {
      const elements = document.querySelectorAll("article h2, article h3");
      const items = [];
      elements.forEach((el) => {
        if (el.id) {
          items.push({
            id: el.id,
            text: el.textContent || "",
            level: el.tagName === "H2" ? 2 : 3
          });
        }
      });
      if (items.length > 0) {
        setHeadings(items);
      }
    }
    scan();
    const observer = new MutationObserver(() => {
      scan();
    });
    const article = document.querySelector("article");
    if (article) {
      observer.observe(article, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, []);
  useEffect3(() => {
    if (headings.length === 0) return;
    if (multi) {
      const visible = /* @__PURE__ */ new Set();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              visible.add(entry.target.id);
            } else {
              visible.delete(entry.target.id);
            }
          }
          if (visible.size === 0) {
            const first = headings[0];
            if (first) {
              setActive(first.id);
              setActiveRange([first.id]);
            }
          } else {
            const ordered = headings.filter((h) => visible.has(h.id));
            setActive(ordered[0]?.id || "");
            setActiveRange(ordered.map((h) => h.id));
          }
        },
        { rootMargin: "0px", threshold: 0.5 }
      );
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
      return () => observer.disconnect();
    }
    let ticking = false;
    function update() {
      const atBottom = window.innerHeight + Math.ceil(window.scrollY) >= document.documentElement.scrollHeight;
      if (atBottom) {
        setActive(headings[headings.length - 1].id);
        return;
      }
      const offset = 100;
      let current = "";
      const items = headings.slice(0, -1);
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }
      if (!current && headings.length > 0) {
        current = headings[0].id;
      }
      setActive(current);
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings, multi]);
  return { headings, active, activeRange };
}

// src/components/toc/default.tsx
import { useEffect as useEffect4, useRef as useRef4, useState as useState7 } from "react";

// src/components/toc/zigzag.tsx
import { Fragment, jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function getLineOffset(level) {
  return level >= 3 ? 10 : 0;
}
function ZigzagLine({ heading, upper = heading.level, lower = heading.level }) {
  const offset = getLineOffset(heading.level);
  const upperOffset = getLineOffset(upper);
  const lowerOffset = getLineOffset(lower);
  return /* @__PURE__ */ jsxs8(Fragment, { children: [
    offset !== upperOffset && /* @__PURE__ */ jsx8(
      "svg",
      {
        viewBox: "0 0 16 16",
        className: "absolute -top-1.5 left-0 size-4",
        "aria-hidden": "true",
        children: /* @__PURE__ */ jsx8(
          "line",
          {
            x1: upperOffset,
            y1: "0",
            x2: offset,
            y2: "12",
            className: "stroke-line",
            strokeWidth: "1"
          }
        )
      }
    ),
    /* @__PURE__ */ jsx8(
      "div",
      {
        className: `absolute inset-y-0 w-px bg-line ${offset !== upperOffset ? "top-1.5" : ""} ${offset !== lowerOffset ? "bottom-1.5" : ""}`,
        style: { left: offset }
      }
    )
  ] });
}
function getItemOffset(level) {
  return level >= 3 ? 26 : 14;
}

// src/components/toc/default.tsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
function TocDefault({ headings, active, activeRange, zigzag }) {
  const containerRef = useRef4(null);
  const [svg, setSvg] = useState7(null);
  const [thumb, setThumb] = useState7({ top: 0, height: 0 });
  const range = activeRange.length > 0 ? activeRange : active ? [active] : [];
  const isActive = (id) => range.includes(id);
  useEffect4(() => {
    if (!zigzag || !containerRef.current || headings.length === 0) return;
    const container = containerRef.current;
    function buildPath() {
      if (container.clientHeight === 0) return;
      let w = 0;
      let h = 0;
      const d = [];
      for (let i = 0; i < headings.length; i++) {
        const item = headings[i];
        if (!item) continue;
        const element = container.querySelector(`a[href="#${item.id}"]`);
        if (!element) continue;
        const styles = getComputedStyle(element);
        const offset = item.level >= 3 ? 10.5 : 0.5;
        const top = element.offsetTop + parseFloat(styles.paddingTop);
        const bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);
        w = Math.max(offset, w);
        h = Math.max(h, bottom);
        d.push(`${i === 0 ? "M" : "L"}${offset} ${top}`);
        d.push(`L${offset} ${bottom}`);
      }
      setSvg({ path: d.join(" "), width: w + 1, height: h });
    }
    const observer = new ResizeObserver(buildPath);
    buildPath();
    observer.observe(container);
    return () => observer.disconnect();
  }, [headings, zigzag]);
  useEffect4(() => {
    if (!zigzag || !containerRef.current || range.length === 0) return;
    const container = containerRef.current;
    let upper = Infinity;
    let lower = 0;
    for (const id of range) {
      const element = container.querySelector(`a[href="#${id}"]`);
      if (!element) continue;
      const styles = getComputedStyle(element);
      const top = element.offsetTop + parseFloat(styles.paddingTop);
      const bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);
      upper = Math.min(upper, top);
      lower = Math.max(lower, bottom);
    }
    if (upper !== Infinity) {
      setThumb({ top: upper, height: lower - upper });
    }
  }, [range, zigzag]);
  if (zigzag) {
    return /* @__PURE__ */ jsxs9("nav", { "aria-label": "table of contents", className: "relative", children: [
      svg && /* @__PURE__ */ jsx9(
        "div",
        {
          className: "absolute left-0 top-0 pointer-events-none z-10",
          style: {
            width: svg.width,
            height: svg.height,
            maskImage: `url("data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`
            )}")`
          },
          children: /* @__PURE__ */ jsx9(
            "div",
            {
              className: "absolute w-full bg-fg transition-[top,height] duration-150",
              style: { top: thumb.top, height: thumb.height }
            }
          )
        }
      ),
      /* @__PURE__ */ jsx9("div", { ref: containerRef, className: "flex flex-col relative", children: headings.map((heading, i) => /* @__PURE__ */ jsxs9(
        "a",
        {
          href: `#${heading.id}`,
          "aria-current": isActive(heading.id) ? "true" : void 0,
          className: `relative py-1.5 text-sm transition-colors ${isActive(heading.id) ? "text-fg" : "text-muted hover:text-fg"}`,
          style: { paddingLeft: getItemOffset(heading.level) },
          children: [
            /* @__PURE__ */ jsx9(
              ZigzagLine,
              {
                heading,
                upper: headings[i - 1]?.level,
                lower: headings[i + 1]?.level
              }
            ),
            heading.text
          ]
        },
        heading.id
      )) })
    ] });
  }
  return /* @__PURE__ */ jsx9("nav", { "aria-label": "table of contents", className: "border-l border-line", children: /* @__PURE__ */ jsx9("ul", { className: "space-y-1", children: headings.map((heading) => /* @__PURE__ */ jsx9("li", { children: /* @__PURE__ */ jsx9(
    "a",
    {
      href: `#${heading.id}`,
      "aria-current": isActive(heading.id) ? "true" : void 0,
      className: `block text-xs py-1 transition-colors border-l -ml-px ${heading.level === 3 ? "pl-6" : "pl-4"} ${isActive(heading.id) ? "text-fg border-fg" : "text-muted hover:text-fg border-transparent"}`,
      children: heading.text
    }
  ) }, heading.id)) }) });
}

// src/components/toc/minimal.tsx
import { useEffect as useEffect5, useRef as useRef5, useState as useState8 } from "react";
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
function TocMinimal({ headings, active, zigzag }) {
  const containerRef = useRef5(null);
  const thumbRef = useRef5(null);
  const progressRef = useRef5(null);
  const [svg, setSvg] = useState8(null);
  useEffect5(() => {
    if (!zigzag || !containerRef.current || headings.length === 0) return;
    const container = containerRef.current;
    function buildPath() {
      if (container.clientHeight === 0) return;
      let w = 0;
      let h = 0;
      const d = [];
      for (let i = 0; i < headings.length; i++) {
        const item = headings[i];
        if (!item) continue;
        const element = container.querySelector(`a[href="#${item.id}"]`);
        if (!element) continue;
        const styles = getComputedStyle(element);
        const offset = item.level >= 3 ? 10.5 : 0.5;
        const top = element.offsetTop + parseFloat(styles.paddingTop);
        const bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);
        w = Math.max(offset, w);
        h = Math.max(h, bottom);
        d.push(`${i === 0 ? "M" : "L"}${offset} ${top}`);
        d.push(`L${offset} ${bottom}`);
      }
      setSvg({ path: d.join(" "), width: w + 1, height: h });
    }
    const observer = new ResizeObserver(buildPath);
    buildPath();
    observer.observe(container);
    return () => observer.disconnect();
  }, [headings, zigzag]);
  useEffect5(() => {
    const container = containerRef.current;
    const thumb = thumbRef.current;
    const progress = progressRef.current;
    if (!container) return;
    let ticking = false;
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? scrollTop / docHeight : 0;
      if (progress) {
        progress.style.height = `${percent * 100}%`;
      } else if (thumb) {
        const containerHeight = container.offsetHeight;
        const thumbHeight = 12;
        const maxTop = containerHeight - thumbHeight;
        const y = percent * maxTop;
        thumb.style.transform = `translateY(${y}px)`;
      }
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [svg]);
  if (zigzag) {
    return /* @__PURE__ */ jsxs10("nav", { "aria-label": "table of contents", className: "relative", children: [
      svg && /* @__PURE__ */ jsx10(
        "div",
        {
          className: "absolute left-0 top-0 pointer-events-none z-10",
          style: {
            width: svg.width,
            height: svg.height,
            maskImage: `url("data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`
            )}")`
          },
          children: /* @__PURE__ */ jsx10(
            "div",
            {
              ref: progressRef,
              className: "w-full bg-fg transition-[height] duration-100 ease-out"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx10("div", { ref: containerRef, className: "flex flex-col", children: headings.map((heading, i) => /* @__PURE__ */ jsxs10(
        "a",
        {
          href: `#${heading.id}`,
          "aria-current": active === heading.id ? "true" : void 0,
          className: `relative py-1.5 text-sm transition-colors ${active === heading.id ? "text-fg" : "text-muted hover:text-fg"}`,
          style: { paddingLeft: getItemOffset(heading.level) },
          children: [
            /* @__PURE__ */ jsx10(
              ZigzagLine,
              {
                heading,
                upper: headings[i - 1]?.level,
                lower: headings[i + 1]?.level
              }
            ),
            heading.text
          ]
        },
        heading.id
      )) })
    ] });
  }
  return /* @__PURE__ */ jsxs10("nav", { "aria-label": "table of contents", className: "flex gap-3", children: [
    /* @__PURE__ */ jsx10("div", { ref: containerRef, className: "relative w-0.5 bg-line rounded-full", children: /* @__PURE__ */ jsx10(
      "div",
      {
        ref: thumbRef,
        className: "absolute left-0 top-0 w-full h-3 bg-fg rounded-full",
        style: { willChange: "transform" }
      }
    ) }),
    /* @__PURE__ */ jsx10("ul", { className: "space-y-1", children: headings.map((heading) => /* @__PURE__ */ jsx10("li", { children: /* @__PURE__ */ jsx10(
      "a",
      {
        href: `#${heading.id}`,
        "aria-current": active === heading.id ? "true" : void 0,
        className: `block text-xs py-1 transition-colors ${heading.level === 3 ? "pl-2" : ""} ${active === heading.id ? "text-fg" : "text-muted hover:text-fg"}`,
        children: heading.text
      }
    ) }, heading.id)) })
  ] });
}

// src/components/toc/index.tsx
import { jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
function Toc({ variant = "default", zigzag = false, multi = false }) {
  const { headings, active, activeRange } = useToc(variant !== "minimal" && multi);
  if (headings.length === 0) return null;
  const renderToc = () => {
    switch (variant) {
      case "minimal":
        return /* @__PURE__ */ jsx11(TocMinimal, { headings, active, zigzag });
      default:
        return /* @__PURE__ */ jsx11(
          TocDefault,
          {
            headings,
            active,
            activeRange,
            zigzag
          }
        );
    }
  };
  return /* @__PURE__ */ jsx11("aside", { className: "w-52 shrink-0 hidden xl:block py-12", children: /* @__PURE__ */ jsxs11("div", { className: "sticky top-12 pr-4", children: [
    /* @__PURE__ */ jsx11("p", { className: "text-xs text-muted mb-4", children: "on this page" }),
    renderToc()
  ] }) });
}
export {
  CodeBlock,
  Content,
  Create,
  Install,
  NavLink,
  Search,
  Sidebar,
  Toc,
  useToc
};
