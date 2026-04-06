import type { ComponentType } from "react";

export type MdxComponent = ComponentType<unknown>;

/** Map of component names to React components available in MDX */
export type MdxScope = Record<string, MdxComponent>;

/** Configuration for building an MDX scope with defaults, overrides, and aliases */
export interface MdxScopeConfig {
  defaults?: MdxScope;
  overrides?: MdxScope;
  aliases?: Record<string, string>;
}

/** Build an MDX scope from defaults, overrides, and aliases */
export function createScope(config?: MdxScopeConfig): MdxScope {
  if (!config) {
    return {};
  }
  const base = { ...config.defaults };
  if (config.overrides) {
    for (const [key, value] of Object.entries(config.overrides)) {
      base[key] = value;
    }
  }
  if (config.aliases) {
    for (const [alias, target] of Object.entries(config.aliases)) {
      const component = base[target];
      if (component) {
        base[alias] = component;
      }
    }
  }
  return base;
}

/** Merge multiple MDX scopes into one, later scopes take precedence */
export function mergeScopes(...scopes: MdxScope[]): MdxScope {
  const result: MdxScope = {};
  for (const scope of scopes) {
    for (const [key, value] of Object.entries(scope)) {
      result[key] = value;
    }
  }
  return result;
}

/** Layer a scope on top of defaults, keeping existing entries from scope */
export function withDefaults(scope: MdxScope, defaults: MdxScope): MdxScope {
  const result = { ...defaults };
  for (const [key, value] of Object.entries(scope)) {
    result[key] = value;
  }
  return result;
}

/** Return a new scope containing only the allowed component names */
export function filterScope(scope: MdxScope, allowed: string[]): MdxScope {
  const set = new Set(allowed);
  const result: MdxScope = {};
  for (const [key, value] of Object.entries(scope)) {
    if (set.has(key)) {
      result[key] = value;
    }
  }
  return result;
}

/** Extract PascalCase function exports from an import record into an MDX scope */
export function scopeFromImports(imports: Record<string, unknown>): MdxScope {
  const result: MdxScope = {};
  for (const [key, value] of Object.entries(imports)) {
    if (/^[A-Z]/.test(key) && typeof value === "function") {
      result[key] = value as MdxComponent;
    }
  }
  return result;
}

/** Return a sorted list of component names in the scope */
export function listComponents(scope: MdxScope): string[] {
  return Object.keys(scope).sort();
}
