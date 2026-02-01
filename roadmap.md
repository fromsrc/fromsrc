# fromsrc roadmap

## packages

we own `fromsrc` and `@fromsrc/*` on npm.

### strategy
- core has everything that doesn't add heavy deps
- split only for features with significant dependencies
- target: 5 packages max

### structure
```
fromsrc              core (components, hooks, content utils)
create-fromsrc       cli scaffolding (npx create-fromsrc)
@fromsrc/openapi     openapi/swagger support (adds swagger-parser)
@fromsrc/algolia     algolia search adapter (adds algoliasearch)
@fromsrc/orama       local search with orama (adds @orama/orama)
```

### what goes in core
- all components (toc, sidebar, search, codeblock, callout, tabs, etc)
- all hooks (useToc, useSearch, etc)
- content utilities (defineContent, schema)
- mdx rendering
- basic client-side search (no external deps)

### what gets its own package
- openapi: adds ~200kb of swagger parsing deps
- algolia: adds algolia sdk (~50kb)
- orama: adds orama engine (~100kb)
- future adapters that add significant deps

### why this works
- one install for 90% of users
- tree-shaking removes unused code
- optional packages only for heavy features
- simple mental model: need openapi? add @fromsrc/openapi

---

## done
- [x] core package setup (tsup, typescript)
- [x] toc component with variants (default, minimal)
- [x] toc zigzag mode with svg mask
- [x] toc scroll progress indicator
- [x] toc multi-select highlighting
- [x] useToc hook with full types
- [x] sidebar component
- [x] search component (basic client-side)
- [x] content component (mdx rendering)
- [x] codeblock component with language icons
- [x] install/create components
- [x] docs app structure
- [x] api routes for raw content
- [x] callout component (info, warning, error, tip)
- [x] steps/step components
- [x] tabs/tab components
- [x] cards/card components
- [x] accordion/accordionitem components
- [x] files/folder/file components
- [x] biome config
- [x] component documentation with live examples
- [x] breadcrumb component
- [x] theme toggle component
- [x] fuzzy search with ranking
- [x] mobile navigation
- [x] link component (external link icon)
- [x] badge component (status labels)
- [x] llms.txt endpoint for ai tools

## next
- [ ] benchmark builds at scale (1k, 3k, 5k files)
- [ ] copy button improvements
- [ ] highlight matching text in search results
- [ ] per-page .md raw endpoints

## future
- [ ] i18n support (in core, no extra deps)
- [ ] versioning (in core)
- [ ] @fromsrc/openapi package
- [ ] @fromsrc/algolia package
- [ ] @fromsrc/orama package
- [ ] more framework support (vite, astro) - may need @fromsrc/vite
