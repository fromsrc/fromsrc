"use client";

import { memo, useMemo } from "react";
import type { ReactNode } from "react";

export interface DiffViewProps {
  before: string;
  after: string;
  lang?: string;
  title?: string;
  mode?: "unified" | "split";
}

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  beforeNum?: number;
  afterNum?: number;
}

function computeDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const m = beforeLines.length;
  const n = afterLines.length;
  const lcs: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const row = lcs[i];
      const prevRow = lcs[i - 1];
      if (!row || !prevRow) {
        continue;
      }
      const diag = prevRow[j - 1] ?? 0;
      const up = prevRow[j] ?? 0;
      const left = row[j - 1] ?? 0;
      if (beforeLines[i - 1] === afterLines[j - 1]) {
        row[j] = diag + 1;
      } else {
        row[j] = Math.max(up, left);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = m;
  let j = n;
  let beforeNum = m;
  let afterNum = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && beforeLines[i - 1] === afterLines[j - 1]) {
      const content = beforeLines[i - 1];
      if (content === undefined) {
        break;
      }
      result.unshift({
        afterNum,
        beforeNum,
        content,
        type: "context",
      });
      i--;
      j--;
      beforeNum--;
      afterNum--;
    } else if (
      j > 0 &&
      (i === 0 || (lcs[i]?.[j - 1] ?? 0) >= (lcs[i - 1]?.[j] ?? 0))
    ) {
      const content = afterLines[j - 1];
      if (content === undefined) {
        break;
      }
      result.unshift({ afterNum, content, type: "add" });
      j--;
      afterNum--;
    } else if (i > 0) {
      const content = beforeLines[i - 1];
      if (content === undefined) {
        break;
      }
      result.unshift({ beforeNum, content, type: "remove" });
      i--;
      beforeNum--;
    }
  }

  return result;
}

const containerStyle = {
  backgroundColor: "#0d0d0d",
  border: "1px solid #1c1c1c",
  borderRadius: "8px",
  margin: "24px 0",
  overflow: "hidden",
  position: "relative" as const,
};

const headerStyle = {
  alignItems: "center",
  backgroundColor: "#161b22",
  borderBottom: "1px solid #1c1c1c",
  display: "flex",
  height: "40px",
  justifyContent: "space-between",
  padding: "0 16px",
};

const titleStyle = {
  color: "#a0a0a0",
  fontFamily: "ui-monospace, monospace",
  fontSize: "0.8rem",
};

const lineStyle = {
  display: "flex",
  fontFamily: "ui-monospace, monospace",
  fontSize: "13px",
  lineHeight: "1.6",
};

const lineNumStyle = {
  color: "#4a4a4a",
  display: "inline-block",
  padding: "0 8px",
  textAlign: "right" as const,
  userSelect: "none" as const,
  width: "40px",
};

function DiffLineComponent({
  line,
  showBefore,
}: {
  line: DiffLine;
  showBefore?: boolean;
}): ReactNode {
  const num = showBefore ? line.beforeNum : line.afterNum || line.beforeNum;
  const bg =
    line.type === "add"
      ? "rgba(46, 160, 67, 0.15)"
      : line.type === "remove"
        ? "rgba(248, 81, 73, 0.15)"
        : "transparent";
  const color =
    line.type === "add"
      ? "#3fb950"
      : line.type === "remove"
        ? "#f85149"
        : "#e6edf3";
  const prefix =
    line.type === "add" ? "+ " : line.type === "remove" ? "- " : "";

  return (
    <div style={{ ...lineStyle, backgroundColor: bg }}>
      <span style={lineNumStyle}>{num}</span>
      <span style={{ flex: 1, paddingLeft: "8px", paddingRight: "16px" }}>
        <span style={{ color }}>
          {prefix}
          {line.content}
        </span>
      </span>
    </div>
  );
}

export const DiffView = memo(function DiffView({
  before,
  after,
  lang,
  title,
  mode = "unified",
}: DiffViewProps): ReactNode {
  const diff = useMemo(() => computeDiff(before, after), [before, after]);
  const hasHeader = title || lang;

  if (mode === "split") {
    return (
      <figure role="group" style={containerStyle}>
        {hasHeader && (
          <div style={headerStyle}>
            <span style={titleStyle}>{title || lang}</span>
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            maxHeight: "500px",
            overflow: "auto",
          }}
        >
          <div style={{ borderRight: "1px solid #1c1c1c" }}>
            {diff.map((line, idx) =>
              line.type === "add" ? null : (
                <DiffLineComponent key={idx} line={line} showBefore />
              )
            )}
          </div>
          <div>
            {diff.map((line, idx) =>
              line.type === "remove" ? null : (
                <DiffLineComponent key={idx} line={line} />
              )
            )}
          </div>
        </div>
      </figure>
    );
  }

  return (
    <figure role="group" style={containerStyle}>
      {hasHeader && (
        <div style={headerStyle}>
          <span style={titleStyle}>{title || lang}</span>
        </div>
      )}
      <div style={{ maxHeight: "500px", overflow: "auto" }}>
        {diff.map((line, idx) => (
          <DiffLineComponent key={idx} line={line} />
        ))}
      </div>
    </figure>
  );
});
