"use client";

import { memo, useCallback, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export interface FilesProps {
  children: ReactNode;
  label?: string;
}

export const Files = memo(function Files({
  children,
  label = "File tree",
}: FilesProps): ReactNode {
  return (
    <div
      role="tree"
      aria-label={label}
      className="my-6 rounded-xl border border-line bg-fg/[0.02] p-3 font-mono text-sm"
    >
      {children}
    </div>
  );
});

export interface FileProps {
  name: string;
  icon?: ReactNode;
}

export const File = memo(function File({ name, icon }: FileProps): ReactNode {
  return (
    <div
      role="treeitem"
      aria-selected={false}
      tabIndex={0}
      className="flex items-center gap-2 px-2 py-1 text-muted rounded focus:outline-none focus:ring-1 focus:ring-fg/20"
    >
      {icon || (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="size-3.5 shrink-0 opacity-40"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      )}
      <span>{name}</span>
    </div>
  );
});

export interface FolderProps {
  name: string;
  children?: ReactNode;
  defaultOpen?: boolean;
}

export function Folder({
  name,
  children,
  defaultOpen = false,
}: FolderProps): ReactNode {
  const [open, setOpen] = useState(defaultOpen);

  const toelement = useCallback(
    (value: Element | null | undefined): HTMLElement | null =>
      value instanceof HTMLElement ? value : null,
    []
  );

  const toggle = useCallback((): void => {
    setOpen((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>): void => {
      switch (event.key) {
        case "ArrowRight": {
          if (!open) {
            setOpen(true);
            event.preventDefault();
          }
          break;
        }
        case "ArrowLeft": {
          if (open) {
            setOpen(false);
            event.preventDefault();
          }
          break;
        }
        case "ArrowDown": {
          {
            const next =
              event.currentTarget.closest(
                "[role=treeitem]"
              )?.nextElementSibling;
            const focusable = toelement(
              next?.querySelector("button, [tabindex='0']")
            );
            focusable?.focus();
            event.preventDefault();
          }
          break;
        }
        case "ArrowUp": {
          {
            const prev =
              event.currentTarget.closest(
                "[role=treeitem]"
              )?.previousElementSibling;
            const focusable = toelement(
              prev?.querySelector("button, [tabindex='0']")
            );
            focusable?.focus();
            event.preventDefault();
          }
          break;
        }
        case "Enter":
        case " ": {
          toggle();
          event.preventDefault();
          break;
        }
        case "Home": {
          {
            const tree = event.currentTarget.closest("[role=tree]");
            const first = toelement(
              tree?.querySelector("button, [tabindex='0']")
            );
            first?.focus();
            event.preventDefault();
          }
          break;
        }
        case "End": {
          {
            const tree = event.currentTarget.closest("[role=tree]");
            const all = tree?.querySelectorAll("button, [tabindex='0']");
            const last =
              all && all.length > 0
                ? toelement(all[all.length - 1] ?? null)
                : null;
            last?.focus();
            event.preventDefault();
          }
          break;
        }
      }
    },
    [open, toggle, toelement]
  );

  return (
    <div role="treeitem" aria-expanded={open}>
      <button
        type="button"
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center gap-2 px-2 py-1 text-left text-fg hover:bg-fg/5 rounded focus:outline-none focus:ring-1 focus:ring-fg/20"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className={`size-3 shrink-0 opacity-30 transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="size-3.5 shrink-0 opacity-40"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
        <span>{name}</span>
      </button>
      {open && children && (
        <div role="group" className="ml-4 border-l border-line/50 pl-2">
          {children}
        </div>
      )}
    </div>
  );
}
