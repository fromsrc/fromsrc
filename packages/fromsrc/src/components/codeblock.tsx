"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useCopy } from "../hooks/copy";
import { LangIcon } from "./langicon";

const wrapKey = "fromsrc-code-wrap";
const wrapEvent = "fromsrc-code-wrap-event";
const lineNumberStyle = `[data-line-numbers] code{counter-reset:line}[data-line-numbers] .line::before{counter-increment:line;content:counter(line);display:inline-block;width:3ch;margin-right:1.5ch;text-align:right;color:#4a4a4a;user-select:none;-webkit-user-select:none;font-variant-numeric:tabular-nums}`;

const iconStyle = { height: 14, width: 14 };
const btnStyle = {
  alignItems: "center",
  background: "transparent",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  padding: "6px",
  transition: "color 0.15s",
} as const;

interface CopyBtnProps {
  codeRef: React.RefObject<HTMLDivElement | null>;
}

const CopyBtn = memo(function CopyBtn({ codeRef }: CopyBtnProps): ReactNode {
  const { copied, copy } = useCopy();
  return (
    <>
      <button
        type="button"
        onClick={() => copy(codeRef.current?.textContent ?? "")}
        aria-label={copied ? "Copied" : "Copy code"}
        className="hover:text-neutral-50"
        style={{ ...btnStyle, color: copied ? "#22c55e" : "#737373" }}
      >
        {copied ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={iconStyle}
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={iconStyle}
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "copied to clipboard" : ""}
      </span>
    </>
  );
});

interface WrapBtnProps {
  wrap: boolean;
  toggle: () => void;
}

const WrapBtn = memo(function WrapBtn({
  wrap,
  toggle,
}: WrapBtnProps): ReactNode {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle word wrap"
      className="hover:text-neutral-50"
      style={{ ...btnStyle, color: wrap ? "#ef4444" : "#737373" }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={iconStyle}
        aria-hidden="true"
      >
        <path
          d="M3 6h18M3 12h15a3 3 0 1 1 0 6H9m0 0 3-3m-3 3 3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
});

/** Code block with syntax highlighting, copy button, and word wrap toggle */
export interface CodeBlockProps {
  children: ReactNode;
  /** Language identifier for syntax highlighting and icon */
  lang?: string;
  /** Title shown in the header bar */
  title?: string;
  /** Show line numbers */
  lines?: boolean;
  /** Show copy button (default: true) */
  showCopy?: boolean;
  /** Show word wrap toggle (default: true) */
  showWrap?: boolean;
  /** Custom background color (default: uses CSS variable --color-code-bg or #0a0a0a) */
  background?: string;
  /** Custom border color (default: uses CSS variable --color-code-border or rgba(255,255,255,0.08)) */
  borderColor?: string;
  /** Custom header background (default: uses CSS variable --color-code-header or rgba(255,255,255,0.02)) */
  headerBackground?: string;
}

export const CodeBlock = memo(function CodeBlock({
  children,
  lang,
  title,
  lines,
  showCopy = true,
  showWrap = true,
  background,
  borderColor,
  headerBackground,
}: CodeBlockProps): ReactNode {
  const codeRef = useRef<HTMLDivElement>(null);
  const hasHeader = Boolean(title || lang);
  const label = title || lang;
  const [wrap, setWrap] = useState(false);

  useEffect(() => {
    try {
      setWrap(localStorage.getItem(wrapKey) === "1");
    } catch {}
    const handler = (event: Event): void => {
      const value = (event as CustomEvent<string>).detail;
      setWrap(value === "1");
    };
    window.addEventListener(wrapEvent, handler);
    return () => window.removeEventListener(wrapEvent, handler);
  }, []);

  const toggle = useCallback((): void => {
    const next = !wrap;
    const value = next ? "1" : "0";
    setWrap(next);
    try {
      localStorage.setItem(wrapKey, value);
    } catch {}
    window.dispatchEvent(new CustomEvent(wrapEvent, { detail: value }));
  }, [wrap]);

  const hasControls = showWrap || showCopy;

  const controls = hasControls ? (
    <div style={{ alignItems: "center", display: "flex", gap: "4px" }}>
      {showWrap && <WrapBtn wrap={wrap} toggle={toggle} />}
      {showCopy && <CopyBtn codeRef={codeRef} />}
    </div>
  ) : null;

  const bg = background ?? "var(--color-code-bg, #0a0a0a)";
  const border =
    borderColor ?? "var(--color-code-border, rgba(255,255,255,0.08))";
  const headerBg =
    headerBackground ?? "var(--color-code-header, rgba(255,255,255,0.02))";

  return (
    <figure
      role="group"
      aria-label={hasHeader ? label : undefined}
      data-line-numbers={lines || undefined}
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: "12px",
        margin: "24px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {lines && <style dangerouslySetInnerHTML={{ __html: lineNumberStyle }} />}
      {hasHeader && (
        <div
          style={{
            alignItems: "center",
            backgroundColor: headerBg,
            borderBottom: `1px solid ${border}`,
            display: "flex",
            height: "40px",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
            {lang && <LangIcon lang={lang} />}
            <span
              style={{
                color: "#a0a0a0",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.8rem",
              }}
            >
              {label}
            </span>
          </div>
          {controls}
        </div>
      )}
      <div
        ref={codeRef}
        tabIndex={0}
        role="region"
        aria-label={hasHeader ? `${label} code` : "code"}
        className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] focus:outline-none focus:ring-1 focus:ring-dim"
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          maxHeight: "500px",
          overflow: wrap ? "visible" : "auto",
          padding: "14px 16px",
          whiteSpace: wrap ? "pre-wrap" : "pre",
          wordBreak: wrap ? "break-all" : "normal",
        }}
      >
        {children}
      </div>
      {!hasHeader && controls && (
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "4px",
            position: "absolute",
            right: "8px",
            top: "8px",
          }}
        >
          {controls}
        </div>
      )}
    </figure>
  );
});
