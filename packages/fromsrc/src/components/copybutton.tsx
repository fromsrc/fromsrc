"use client";

import { memo, useCallback } from "react";
import type { ReactElement } from "react";

import { useCopy } from "../hooks/copy";
import { IconCheck, IconCopy } from "./icons";

export interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButtonBase({
  text,
  label = "Copy to clipboard",
}: CopyButtonProps): ReactElement {
  const { copied, copy } = useCopy();

  const handleClick = useCallback((): void => {
    copy(text);
  }, [copy, text]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      if (!copied) {
        e.currentTarget.style.color = "#fafafa";
      }
    },
    [copied]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      if (!copied) {
        e.currentTarget.style.color = "#737373";
      }
    },
    [copied]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? "Copied to clipboard" : label}
      aria-live="polite"
      style={{
        alignItems: "center",
        background: "transparent",
        border: "none",
        color: copied ? "#22c55e" : "#737373",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        padding: "6px",
        transition: "color 0.15s",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
    </button>
  );
}

export const CopyButton = memo(CopyButtonBase);
