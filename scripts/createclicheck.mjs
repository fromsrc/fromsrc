import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const bin = join(root, "packages", "create-fromsrc", "dist", "index.js");
const temp = await mkdtemp(join(tmpdir(), "fromsrc-cli-"));

function run(args) {
	return new Promise((resolve) => {
		const child = spawn("node", [bin, ...args], { cwd: temp, stdio: ["pipe", "pipe", "pipe"] });
		let out = "";
		let err = "";
		child.stdout.on("data", (chunk) => {
			out += String(chunk);
		});
		child.stderr.on("data", (chunk) => {
			err += String(chunk);
		});
		child.on("close", (code) => {
			resolve({ code, out, err });
		});
		child.stdin.end();
	});
}

const runhelp = await run(["--help"]);
const runlist = await run(["--list"]);
const runbad = await run(["--name", "bad-docs", "--framework", "bad", "--yes"]);
const runpositional = await run(["cli-positional", "--framework", "next.js", "--yes"]);
const runcase = await run(["--name", "cli-case-next", "--framework", "Next.js", "--yes"]);
const runmissingname = await run(["--name"]);
const runmissingframework = await run(["--framework"]);
const rununknown = await run(["--wat"]);
const cases = [
	{
		name: "cli-next",
		framework: "next.js",
		files: ["package.json", "next.config.ts", "app/docs/[[...slug]]/page.tsx"],
	},
	{
		name: "cli-react-router",
		framework: "react-router",
		files: ["package.json", "index.html", "src/main.tsx"],
	},
	{
		name: "cli-vite",
		framework: "vite",
		files: ["package.json", "index.html", "src/main.tsx"],
	},
	{
		name: "cli-tanstack",
		framework: "tanstack",
		files: ["package.json", "index.html", "src/main.tsx"],
	},
	{
		name: "cli-remix",
		framework: "remix",
		files: ["package.json", "vite.config.ts", "app/root.tsx", "app/routes/_index.tsx"],
	},
	{
		name: "cli-astro",
		framework: "astro",
		files: ["package.json", "astro.config.mjs", "src/pages/index.astro", "src/components/shell.tsx"],
	},
]
const runs = [];
for (const item of cases) {
	runs.push({
		name: item.name,
		framework: item.framework,
		result: await run(["--name", item.name, "--framework", item.framework, "--yes"]),
		files: item.files,
	})
}
const runalias = await run(["--name", "cli-alias-rr", "--framework", "rr", "--yes"]);
const runaliasfull = await run(["--name", "cli-alias-reactrouter", "--framework", "reactrouter", "--yes"]);

const issues = [];
for (const item of runs) {
	if (item.result.code !== 0) {
		issues.push(`${item.framework}: cli exited with ${item.result.code}`);
	}
	if (!item.result.out.includes(`created ${item.name}`)) {
		issues.push(`${item.framework}: output missing creation confirmation`);
	}
	for (const file of item.files) {
		try {
			await access(join(temp, item.name, file));
		} catch {
			issues.push(`${item.framework}: missing ${file}`);
		}
	}
}

if (runalias.code !== 0) {
	issues.push(`alias rr: cli exited with ${runalias.code}`);
}
try {
	await access(join(temp, "cli-alias-rr", "src", "main.tsx"));
} catch {
	issues.push("alias rr: missing src/main.tsx");
}
if (runaliasfull.code !== 0) {
	issues.push(`alias reactrouter: cli exited with ${runaliasfull.code}`);
}
try {
	await access(join(temp, "cli-alias-reactrouter", "src", "main.tsx"));
} catch {
	issues.push("alias reactrouter: missing src/main.tsx");
}
if (runcase.code !== 0) {
	issues.push(`case-insensitive next.js: cli exited with ${runcase.code}`);
}
try {
	await access(join(temp, "cli-case-next", "next.config.ts"));
} catch {
	issues.push("case-insensitive next.js: missing next.config.ts");
}

if (runhelp.code !== 0 || !runhelp.out.includes("usage: create-fromsrc")) {
	issues.push("cli help output missing or failed");
}

if (runlist.code !== 0 || !runlist.out.includes("next.js") || !runlist.out.includes("astro")) {
	issues.push("cli list output missing or failed");
}

if (runbad.code === 0 || !runbad.out.includes("invalid framework")) {
	issues.push("cli invalid framework path missing or failed");
}
if (runmissingname.code === 0 || !runmissingname.out.includes("missing value for --name")) {
	issues.push("cli missing --name value path missing or failed");
}
if (runmissingframework.code === 0 || !runmissingframework.out.includes("missing value for --framework")) {
	issues.push("cli missing --framework value path missing or failed");
}
if (rununknown.code === 0 || !rununknown.out.includes("unknown option")) {
	issues.push("cli unknown option path missing or failed");
}

if (runpositional.code !== 0 || !runpositional.out.includes("created cli-positional")) {
	issues.push("cli positional name path missing or failed");
}
try {
	await access(join(temp, "cli-positional", "package.json"));
} catch {
	issues.push("cli positional name did not create project");
}

await rm(temp, { recursive: true, force: true });

if (issues.length > 0) {
	console.error("x create cli validation failed");
	for (const issue of issues) console.error(issue);
	for (const item of runs) {
		if (item.result.err.trim()) console.error(item.result.err.trim());
	}
	if (runalias.err.trim()) console.error(runalias.err.trim());
	if (runaliasfull.err.trim()) console.error(runaliasfull.err.trim());
	if (runcase.err.trim()) console.error(runcase.err.trim());
	if (runhelp.err.trim()) console.error(runhelp.err.trim());
	if (runlist.err.trim()) console.error(runlist.err.trim());
	if (runbad.err.trim()) console.error(runbad.err.trim());
	if (runmissingname.err.trim()) console.error(runmissingname.err.trim());
	if (runmissingframework.err.trim()) console.error(runmissingframework.err.trim());
	if (rununknown.err.trim()) console.error(rununknown.err.trim());
	if (runpositional.err.trim()) console.error(runpositional.err.trim());
	process.exit(1);
}

console.log("o create cli validation passed");
