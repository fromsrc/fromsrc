import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generate } from "../packages/create-fromsrc/src/generate";

const frameworks = [
	{
		name: "next.js",
		files: ["package.json", "next.config.ts", "next-env.d.ts", "app/layout.tsx", "app/docs/[[...slug]]/page.tsx"],
		checks: [
			{ file: "tsconfig.json", text: "\"jsx\": \"preserve\"" },
			{ file: "tsconfig.json", text: "\"next-env.d.ts\"" },
			{ file: "package.json", text: "\"node\": \"^20.19.0 || >=22.12.0\"" },
		],
	},
	{
		name: "react-router",
		files: ["package.json", "index.html", "src/main.tsx", "src/app.tsx"],
			checks: [
				{ file: "src/main.tsx", text: "createRoot(root).render(" },
				{ file: "tsconfig.json", text: "\"jsx\": \"react-jsx\"" },
				{ file: "tsconfig.json", text: "\"**/*.ts\"" },
				{ file: "package.json", text: "\"vite\": \"^7.1.12\"" },
				{ file: "package.json", text: "\"node\": \"^20.19.0 || >=22.12.0\"" },
			],
		},
	{
		name: "vite",
		files: ["package.json", "index.html", "src/main.tsx", "src/app.tsx"],
			checks: [
				{ file: "src/main.tsx", text: "createRoot(root).render(" },
				{ file: "tsconfig.json", text: "\"jsx\": \"react-jsx\"" },
				{ file: "package.json", text: "\"vite\": \"^7.1.12\"" },
				{ file: "package.json", text: "\"node\": \"^20.19.0 || >=22.12.0\"" },
			],
		},
	{
		name: "tanstack",
		files: ["package.json", "index.html", "src/main.tsx", "src/app.tsx"],
			checks: [
				{ file: "src/main.tsx", text: "createRoot(root).render(" },
				{ file: "tsconfig.json", text: "\"jsx\": \"react-jsx\"" },
				{ file: "package.json", text: "\"vite\": \"^7.1.12\"" },
				{ file: "package.json", text: "\"node\": \"^20.19.0 || >=22.12.0\"" },
			],
		},
	{
		name: "remix",
		files: ["package.json", "vite.config.ts", "app/root.tsx", "app/routes/_index.tsx"],
		checks: [
			{ file: "app/routes/_index.tsx", text: "edit app/routes/_index.tsx to start building docs." },
			{ file: "package.json", text: "\"dev\": \"remix vite:dev\"" },
			{ file: "package.json", text: "\"build\": \"remix vite:build\"" },
			{ file: "package.json", text: "\"start\": \"remix-serve ./build/server/index.js\"" },
			{ file: "tsconfig.json", text: "\"jsx\": \"react-jsx\"" },
			{ file: "package.json", text: "\"node\": \"^20.19.0 || >=22.12.0\"" },
			{ file: "package.json", text: "\"@remix-run/react\": \"^2.17.2\"" },
			{ file: "package.json", text: "\"@remix-run/node\": \"^2.17.2\"" },
			{ file: "package.json", text: "\"@remix-run/dev\": \"^2.17.2\"" },
			{ file: "package.json", text: "\"vite\": \"^7.1.12\"" },
			{ file: "vite.config.ts", text: "vitePlugin as remix" },
		],
	},
	{
		name: "astro",
		files: [
			"package.json",
			"astro.config.mjs",
			"src/pages/index.astro",
			"src/components/shell.tsx",
			"src/env.d.ts",
			"src/styles/global.css",
		],
		checks: [
			{ file: "src/components/shell.tsx", text: "edit files in src/pages/ to start building docs." },
			{ file: "src/pages/index.astro", text: "<Shell client:load />" },
			{ file: "tsconfig.json", text: "\"extends\": \"astro/tsconfigs/strict\"" },
			{ file: "package.json", text: "\"node\": \"^20.19.0 || >=22.12.0\"" },
			{ file: "package.json", text: "\"@astrojs/react\": \"^4.4.0\"" },
			{ file: "astro.config.mjs", text: "integrations: [react()]" },
		],
	},
];

const temp = await mkdtemp(join(tmpdir(), "fromsrc-scaffold-"));
const issues = [];
const initial = process.cwd();

try {
	process.chdir(temp);
	for (const framework of frameworks) {
		const name = `demo-${framework.name.replaceAll(".", "").replaceAll("/", "-")}`;
		generate({ name, framework: framework.name });
		for (const file of framework.files) {
			try {
				await access(join(temp, name, file));
			} catch {
				issues.push(`${framework.name}: missing ${file}`);
			}
		}
		for (const check of framework.checks) {
			const file = join(temp, name, check.file);
			try {
				const content = await readFile(file, "utf8");
				if (!content.includes(check.text)) {
					issues.push(`${framework.name}: ${check.file} missing ${check.text}`);
				}
			} catch {
				issues.push(`${framework.name}: unreadable ${check.file}`);
			}
		}
	}
} finally {
	process.chdir(initial);
	await rm(temp, { recursive: true, force: true });
}

if (issues.length > 0) {
	console.error("x scaffold contract validation failed");
	for (const issue of issues) {
		console.error(issue);
	}
	process.exit(1);
}

console.log(`o scaffold contract validation passed (${frameworks.length} frameworks)`);
