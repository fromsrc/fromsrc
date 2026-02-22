export const frameworks = ["next.js", "react-router", "vite", "tanstack", "remix", "astro"];

export const adapterpaths = [
	"fromsrc/next",
	"fromsrc/react-router",
	"fromsrc/vite",
	"fromsrc/tanstack",
	"fromsrc/remix",
	"fromsrc/astro",
];

export const adapters = [
	{ key: "next", file: "next.ts", name: "nextAdapter", path: "fromsrc/next" },
	{ key: "react-router", file: "reactrouter.ts", name: "reactRouterAdapter", path: "fromsrc/react-router" },
	{ key: "vite", file: "vite.ts", name: "viteAdapter", path: "fromsrc/vite" },
	{ key: "tanstack", file: "tanstack.ts", name: "tanstackAdapter", path: "fromsrc/tanstack" },
	{ key: "remix", file: "remix.ts", name: "remixAdapter", path: "fromsrc/remix" },
	{ key: "astro", file: "astro.ts", name: "astroAdapter", path: "fromsrc/astro" },
];

export const manuals = [
	{
		name: "next.js",
		file: "docs/manual/next.mdx",
		card: 'title="next.js"',
		href: 'href="/docs/manual/next"',
		install: "bun add fromsrc",
		tokens: ["fromsrc/next", "AdapterProvider", "nextAdapter"],
	},
	{
		name: "react router",
		file: "docs/manual/react-router.mdx",
		card: 'title="react router"',
		href: 'href="/docs/manual/react-router"',
		install: "bun add fromsrc react-router",
		tokens: ["fromsrc/react-router", "AdapterProvider", "reactRouterAdapter"],
	},
	{
		name: "vite",
		file: "docs/manual/vite.mdx",
		href: 'href="/docs/manual/vite"',
		card: 'title="vite"',
		install: "bun add fromsrc react-router",
		tokens: ["fromsrc/vite", "AdapterProvider", "viteAdapter", "createadapter"],
	},
	{
		name: "tanstack start",
		file: "docs/manual/tanstack.mdx",
		card: 'title="tanstack start"',
		href: 'href="/docs/manual/tanstack"',
		install: "bun add fromsrc @tanstack/react-router",
		tokens: ["fromsrc/tanstack", "AdapterProvider", "tanstackAdapter"],
	},
	{
		name: "remix",
		file: "docs/manual/remix.mdx",
		card: 'title="remix"',
		href: 'href="/docs/manual/remix"',
		install: "bun add fromsrc @remix-run/react",
		tokens: ["fromsrc/remix", "AdapterProvider", "remixAdapter"],
	},
	{
		name: "astro",
		file: "docs/manual/astro.mdx",
		card: 'title="astro"',
		href: 'href="/docs/manual/astro"',
		install: "bun add fromsrc",
		tokens: ["fromsrc/astro", "AdapterProvider", "astroAdapter"],
	},
];
