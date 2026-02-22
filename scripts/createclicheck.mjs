import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const bin = join(root, "packages", "create-fromsrc", "dist", "index.js");
const temp = await mkdtemp(join(tmpdir(), "fromsrc-cli-"));
const target = join(temp, "sample-docs");

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

const runok = await run(["--name", "sample-docs", "--framework", "next.js", "--yes"]);
const runhelp = await run(["--help"]);
const runbad = await run(["--name", "bad-docs", "--framework", "bad", "--yes"]);

const issues = [];
if (runok.code !== 0) {
	issues.push(`cli exited with ${runok.code}`);
}

try {
	await access(target);
} catch {
	issues.push("cli did not create sample-docs directory");
}

if (!runok.out.includes("created sample-docs")) {
	issues.push("cli output missing creation confirmation");
}

if (runhelp.code !== 0 || !runhelp.out.includes("usage: create-fromsrc")) {
	issues.push("cli help output missing or failed");
}

if (runbad.code === 0 || !runbad.out.includes("invalid framework")) {
	issues.push("cli invalid framework path missing or failed");
}

await rm(temp, { recursive: true, force: true });

if (issues.length > 0) {
	console.error("x create cli validation failed");
	for (const issue of issues) console.error(issue);
	if (runok.err.trim()) console.error(runok.err.trim());
	if (runhelp.err.trim()) console.error(runhelp.err.trim());
	if (runbad.err.trim()) console.error(runbad.err.trim());
	process.exit(1);
}

console.log("o create cli validation passed");
