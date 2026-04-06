"use client";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DocMeta, SearchDoc } from "../content";
import { useDebounce } from "../hooks/debounce";
import { useScrollLock } from "../hooks/scrolllock";
import { useLocalStorage } from "../hooks/storage";
import type { SearchResult } from "../search";
import type { SearchAdapter } from "../search";
import { localSearch } from "../search";
import { trimQuery } from "../searchpolicy";
import { Panel } from "./panel";
import { getRecentOptionId } from "./recent";
import { getOptionId } from "./results";
import { useSearcher } from "./searcher";
import { Trigger } from "./trigger";

export interface SearchProps {
  basePath?: string;
  docs?: (DocMeta | SearchDoc)[];
  endpoint?: string;
  hidden?: boolean;
  adapter?: SearchAdapter;
  debounce?: number;
  limit?: number;
  showRecent?: boolean;
}

function toSearchDoc(doc: DocMeta | SearchDoc): SearchDoc {
  if ("content" in doc) {
    return doc;
  }
  return { ...doc, content: "" };
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function Search({
  basePath = "/docs",
  docs = [],
  endpoint,
  hidden,
  adapter = localSearch,
  debounce = 100,
  limit = 8,
  showRecent = true,
}: SearchProps): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [recent, setRecent] = useLocalStorage<string[]>(
    "fromsrc-recent-searches",
    []
  );
  const [local, setLocal] = useState<SearchResult[]>([]);
  const [adapterLoading, setAdapterLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const queryRef = useRef("");
  const requestRef = useRef(0);
  const lastFocus = useRef<HTMLElement | null>(null);
  const updateQuery = useCallback((next: string): void => {
    const value = trimQuery(next);
    queryRef.current = value;
    setQuery(value);
  }, []);
  const router = useRouter();
  const searchDocs = useMemo(() => docs.map(toSearchDoc), [docs]);
  const value = useDebounce(query, debounce);
  const remote = useSearcher(endpoint, value, limit);
  const remoteResults = useMemo(() => {
    if (!endpoint) {
      return [];
    }
    if (value.trim() !== queryRef.current.trim()) {
      return [];
    }
    return remote.results;
  }, [endpoint, remote.results, value]);
  const results = endpoint ? remoteResults : local;
  const loading = endpoint ? remote.loading : adapterLoading;
  const hasRecent = showRecent && value.trim().length === 0 && recent.length > 0;
  const safe =
    results.length === 0 ? -1 : Math.min(selected, results.length - 1);
  const safeRecent = hasRecent ? Math.min(selected, recent.length - 1) : -1;
  useScrollLock(open);
  const openModal = useCallback((): void => {
    const active = document.activeElement;
    lastFocus.current = active instanceof HTMLElement ? active : null;
    setOpen(true);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        openModal();
      }
      const slash = event.key === "/" || event.code === "Slash";
      if (
        slash &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditable(event.target)
      ) {
        event.preventDefault();
        openModal();
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openModal]);

  useEffect(() => {
    if (open) {
      input.current?.focus();
    } else {
      updateQuery("");
      setSelected(0);
      lastFocus.current?.focus();
    }
  }, [open, updateQuery]);

  useEffect(() => setSelected(0), [value]);

  useEffect(() => {
    if (endpoint) {
      return;
    }
    const id = requestRef.current + 1;
    requestRef.current = id;
    const result = adapter.search(value, searchDocs, limit);
    if (result instanceof Promise) {
      setAdapterLoading(true);
      void result
        .then((next) => {
          if (requestRef.current !== id) {
            return;
          }
          setLocal(next);
          setAdapterLoading(false);
        })
        .catch(() => {
          if (requestRef.current !== id) {
            return;
          }
          setLocal([]);
          setAdapterLoading(false);
        });
      return;
    }
    setLocal(result);
    setAdapterLoading(false);
  }, [adapter, endpoint, limit, searchDocs, value]);

  useEffect(() => {
    const target = hasRecent ? safeRecent : safe;
    if (target < 0 || !list.current) {
      return;
    }
    const id = hasRecent ? getRecentOptionId(target) : getOptionId(target);
    const option = list.current.querySelector(`#${id}`);
    option?.scrollIntoView({ block: "nearest" });
  }, [hasRecent, safe, safeRecent]);

  const save = useCallback(
    (item: string): void => {
      const text = item.trim();
      if (!text) {
        return;
      }
      setRecent((items) =>
        [text, ...items.filter((entry) => entry !== text)].slice(0, 5)
      );
    },
    [setRecent]
  );

  const navigate = useCallback(
    (slug: string | undefined, anchor?: string): void => {
      save(query);
      const target = slug ? `${basePath}/${slug}` : basePath;
      router.push(anchor ? `${target}#${anchor}` : target);
      setOpen(false);
    },
    [basePath, query, router, save]
  );

  const onKey = useCallback(
    (event: React.KeyboardEvent): void => {
      if (hasRecent) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelected((item) => Math.min(item + 1, recent.length - 1));
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelected((item) => Math.max(item - 1, 0));
          return;
        }
        if (event.key === "Home") {
          event.preventDefault();
          setSelected(0);
          return;
        }
        if (event.key === "End") {
          event.preventDefault();
          setSelected(recent.length - 1);
          return;
        }
        if (event.key === "Enter" && safeRecent >= 0 && recent[safeRecent]) {
          event.preventDefault();
          updateQuery(recent[safeRecent]);
          setSelected(0);
          return;
        }
      }
      if (results.length === 0) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((item) => Math.min(item + 1, results.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((item) => Math.max(item - 1, 0));
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        setSelected(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        setSelected(results.length - 1);
        return;
      }
      if (event.key === "Tab" && results[0]) {
        event.preventDefault();
        updateQuery(results[0].doc.title);
        setSelected(0);
        return;
      }
      if (event.key === "Enter" && safe >= 0 && results[safe]) {
        navigate(results[safe].doc.slug, results[safe].anchor);
      }
    },
    [hasRecent, navigate, recent, results, safe, safeRecent, updateQuery]
  );

  if (!open) {
    if (hidden) {
      return null;
    }
    return <Trigger onOpen={openModal} />;
  }

  return (
    <Panel
      query={query}
      value={value}
      safe={hasRecent ? safeRecent : safe}
      recent={showRecent ? recent : []}
      loading={loading}
      results={results}
      input={input}
      list={list}
      onClose={() => setOpen(false)}
      onChange={updateQuery}
      onKey={onKey}
      onSelect={updateQuery}
      onNavigate={navigate}
    />
  );
}
