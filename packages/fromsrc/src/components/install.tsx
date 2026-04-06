"use client";

import { memo, useCallback, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";

import { CopyButton } from "./copybutton";

const Managers = ["npm", "pnpm", "yarn", "bun"] as const;
type Manager = (typeof Managers)[number];

type Mode = "create" | "install";

const Prefixes: Record<Mode, Record<Manager, string>> = {
  create: {
    bun: "bun create",
    npm: "npm create",
    pnpm: "pnpm create",
    yarn: "yarn create",
  },
  install: {
    bun: "bun add",
    npm: "npm i",
    pnpm: "pnpm add",
    yarn: "yarn add",
  },
};

export interface InstallProps {
  package: string;
  mode?: Mode;
}

function InstallBase({
  package: Pkg,
  mode = "install",
}: InstallProps): ReactElement {
  const [Active, setActive] = useState<Manager>("npm");
  const Prefix = Prefixes[mode][Active];
  const Command = `${Prefix} ${Pkg}`;
  const Id = useId();
  const TablistRef = useRef<HTMLDivElement>(null);
  const MapRef = useRef<Map<Manager, number>>(new Map());
  for (const M of Managers) {
    if (!MapRef.current.has(M)) {
      MapRef.current.set(M, MapRef.current.size);
    }
  }
  const GetTabId = useCallback(
    (Value: Manager): string => `${Id}-tab-${MapRef.current.get(Value) ?? 0}`,
    [Id]
  );

  const HandleKeyDown = useCallback(
    (E: KeyboardEvent<HTMLDivElement>): void => {
      const CurrentIndex = Managers.indexOf(Active);
      let NextIndex = CurrentIndex;

      switch (E.key) {
        case "ArrowLeft": {
          NextIndex = CurrentIndex > 0 ? CurrentIndex - 1 : Managers.length - 1;
          break;
        }
        case "ArrowRight": {
          NextIndex = CurrentIndex < Managers.length - 1 ? CurrentIndex + 1 : 0;
          break;
        }
        case "Home": {
          NextIndex = 0;
          break;
        }
        case "End": {
          NextIndex = Managers.length - 1;
          break;
        }
        default: {
          return;
        }
      }

      E.preventDefault();
      const Next = Managers[NextIndex];
      if (Next) {
        setActive(Next);
      }
      const Tabs =
        TablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      Tabs?.[NextIndex]?.focus();
    },
    [Active]
  );

  const HandleTabClick = useCallback((Manager: Manager): void => {
    setActive(Manager);
  }, []);

  return (
    <figure
      role="group"
      aria-label={`Package manager command: ${Command}`}
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
          ref={TablistRef}
          role="tablist"
          aria-label="Package managers"
          onKeyDown={HandleKeyDown}
          style={{ alignItems: "center", display: "flex", gap: "4px" }}
        >
          {Managers.map((M) => (
            <button
              key={M}
              id={GetTabId(M)}
              type="button"
              role="tab"
              aria-selected={Active === M}
              aria-controls={`${Id}-panel`}
              tabIndex={Active === M ? 0 : -1}
              onClick={() => HandleTabClick(M)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom:
                  Active === M ? "2px solid #fafafa" : "2px solid transparent",
                color: Active === M ? "#fafafa" : "#737373",
                cursor: "pointer",
                fontSize: "13px",
                marginBottom: "-1px",
                padding: "4px 10px",
                transition: "color 0.15s",
              }}
            >
              {M}
            </button>
          ))}
        </div>
        <CopyButton text={Command} />
      </div>
      <div
        id={`${Id}-panel`}
        role="tabpanel"
        aria-labelledby={GetTabId(Active)}
        tabIndex={0}
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          padding: "14px 16px",
        }}
      >
        <code aria-label={`Command: ${Command}`}>
          <span style={{ color: "#7ee787" }}>{Prefix}</span>
          <span style={{ color: "#fafafa" }}> {Pkg}</span>
        </code>
      </div>
    </figure>
  );
}

export const Install = memo(InstallBase);
