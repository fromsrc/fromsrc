export const frameworks = ["next.js", "react-router", "vite", "tanstack", "remix", "astro"] as const;

export type Framework = (typeof frameworks)[number];

export const aliases = {
	next: "next.js",
	nextjs: "next.js",
	rr: "react-router",
	router: "react-router",
	reactrouter: "react-router",
	ts: "tanstack",
	tanstackstart: "tanstack",
} as const satisfies Record<string, Framework>;

export function parseframework(value: string | undefined): Framework | undefined {
	if (!value) {
		return undefined;
	}
	const key = value.toLowerCase().replaceAll("_", "").replaceAll("-", "").replaceAll(".", "");
	const mapped = key in aliases ? aliases[key as keyof typeof aliases] : undefined;
	const target = mapped ?? value.toLowerCase();
	return frameworks.find((item) => item.toLowerCase() === target);
}
