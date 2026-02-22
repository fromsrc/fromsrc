export const entrymap = new Map([
	[".", "index.ts"],
	["./client", "client.ts"],
	["./next", "next.ts"],
	["./react-router", "reactrouter.ts"],
	["./vite", "vite.ts"],
	["./tanstack", "tanstack.ts"],
	["./remix", "remix.ts"],
	["./astro", "astro.ts"],
	["./readtime", "readtime.ts"],
	["./searchscore", "searchscore.ts"],
	["./searchindex", "searchindex.ts"],
	["./llms", "llms.ts"],
	["./openapi", "openapi.ts"],
	["./algolia", "algolia.ts"],
	["./orama", "orama.ts"],
	["./styles/reset.css", null],
]);

export const entryfiles = Array.from(entrymap.values()).filter((value) => value !== null);

export const clientkeys = [
	"./client",
	"./next",
	"./react-router",
	"./vite",
	"./tanstack",
	"./remix",
	"./astro",
];
