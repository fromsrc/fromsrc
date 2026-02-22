import { adapterpaths } from "./frameworkset.mjs";

const frameworkentries = adapterpaths.map((path) => {
	const key = `./${path.replace("fromsrc/", "")}`;
	if (key === "./react-router") {
		return [key, "reactrouter.ts"];
	}
	return [key, `${key.replace("./", "")}.ts`];
});

export const entrymap = new Map([
	[".", "index.ts"],
	["./client", "client.ts"],
	...frameworkentries,
	["./readtime", "readtime.ts"],
	["./searchscore", "searchscore.ts"],
	["./searchindex", "searchindex.ts"],
	["./searchpolicy", "searchpolicy.ts"],
	["./llms", "llms.ts"],
	["./openapi", "openapi.ts"],
	["./algolia", "algolia.ts"],
	["./orama", "orama.ts"],
	["./styles/reset.css", null],
]);

export const entryfiles = Array.from(entrymap.values()).filter((value) => value !== null);

export const clientkeys = ["./client", ...frameworkentries.map(([key]) => key)];
