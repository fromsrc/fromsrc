export const targets = [
	{
		name: "home",
		manifest: ".next/server/app/page_client-reference-manifest.js",
		route: "[project]/app/page",
		max: 30000,
		maxgzip: 9000,
	},
	{
		name: "docs",
		manifest: ".next/server/app/docs/[[...slug]]/page_client-reference-manifest.js",
		route: "[project]/app/docs/[[...slug]]/page",
		max: 380000,
		maxgzip: 100000,
	},
];
