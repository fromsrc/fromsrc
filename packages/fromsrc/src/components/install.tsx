"use client";

import { memo, useCallback, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";

import { CopyButton } from "./copybutton";

const managers = ["npm", "pnpm", "yarn", "bun"] as const;
type Manager = (typeof managers)[number];

const commands: Record<Manager, string> = {
  bun: "bun add",
  npm: "npm i",
  pnpm: "pnpm add",
  yarn: "yarn add",
};

export interface InstallProps {
  package: string;
}

function InstallBase({ package: pkg }: InstallProps): ReactElement {
  const [active, setActive] = useState<Manager>("npm");
  const command = `${commands[active]} ${pkg}`;
  const id = useId();
  const tablistRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map<Manager, number>>(new Map());
  for (const manager of managers) {
    if (!mapRef.current.has(manager)) {
      mapRef.current.set(manager, mapRef.current.size);
    }
  }
  const getTabId = useCallback(
    (value: Manager): string => `${id}-tab-${mapRef.current.get(value) ?? 0}`,
    [id]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>): void => {
      const currentIndex = managers.indexOf(active);
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowLeft": {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : managers.length - 1;
          break;
        }
        case "ArrowRight": {
          nextIndex = currentIndex < managers.length - 1 ? currentIndex + 1 : 0;
          break;
        }
        case "Home": {
          nextIndex = 0;
          break;
        }
        case "End": {
          nextIndex = managers.length - 1;
          break;
        }
        default: {
          return;
        }
      }

      e.preventDefault();
      const next = managers[nextIndex];
      if (next) {
        setActive(next);
      }
      const tabs =
        tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      tabs?.[nextIndex]?.focus();
    },
    [active]
  );

  const handleTabClick = useCallback((manager: Manager): void => {
    setActive(manager);
  }, []);

  return (
    <figure
      role="group"
      aria-label={`Install ${pkg} package`}
      style={{
        backgroundColor: "#0d0d0d",
        border: "1px solid #1c1c1c",
        borderRadius: "8px",
        margin: "24px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          alignItems: "center",
          borderBottom: "1px solid #1c1c1c",
          display: "flex",
          height: "40px",
          justifyContent: "space-between",
          padding: "0 12px",
        }}
      >
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Package managers"
          onKeyDown={handleKeyDown}
          style={{ alignItems: "center", display: "flex", gap: "4px" }}
        >
          {managers.map((m, index) => (
            <button
              key={m}
              id={getTabId(m)}
              type="button"
              role="tab"
              aria-selected={active === m}
              aria-controls={`${id}-panel`}
              tabIndex={active === m ? 0 : -1}
              onClick={() => handleTabClick(m)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom:
                  active === m ? "2px solid #fafafa" : "2px solid transparent",
                color: active === m ? "#fafafa" : "#737373",
                cursor: "pointer",
                fontSize: "13px",
                marginBottom: "-1px",
                padding: "4px 10px",
                transition: "color 0.15s",
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <CopyButton text={command} />
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={getTabId(active)}
        tabIndex={0}
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          padding: "14px 16px",
        }}
      >
        <code aria-label={`Command: ${command}`}>
          <span style={{ color: "#7ee787" }}>{commands[active]}</span>
          <span style={{ color: "#fafafa" }}> {pkg}</span>
        </code>
      </div>
    </figure>
  );
}

export const Install = memo(InstallBase);
