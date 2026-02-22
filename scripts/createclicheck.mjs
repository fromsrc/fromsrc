import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const bin = join(root, "packages", "create-fromsrc", "dist", "index.js");
const temp = await mkdtemp(join(tmpdir(), "fromsrc-cli-"));
const target = join(temp, "sample-docs");
const run = await new Promise((resolve) => {
	const child = spawn("node", [bin], { cwd: temp, stdio: ["pipe", "pipe", "pipe"] });
	let out = "";
	let err = "";
	let sentName = false;
	let sentFramework = false;
	child.stdout.on("data", (chunk) => {
		out += String(chunk);
		if (!sentName && out.includes("project name")) {
			child.stdin.write("sample-docs\n");
			sentName = true;
		}
		if (!sentFramework && out.includes("choose")) {
			child.stdin.write("1\n");
			child.stdin.end();
			sentFramework = true;
		}
	});
	child.stderr.on("data", (chunk) => {
		err += String(chunk);
	});
	child.on("close", (code) => {
		resolve({ code, out, err });
	});
});

const issues = [];
if (run.code !== 0) {
	issues.push(`cli exited with ${run.code}`);
}

try {
	await access(target);
} catch {
	issues.push("cli did not create sample-docs directory");
}

if (!run.out.includes("created sample-docs")) {
	issues.push("cli output missing creation confirmation");
}

await rm(temp, { recursive: true, force: true });

if (issues.length > 0) {
	console.error("x create cli validation failed");
	for (const issue of issues) console.error(issue);
	if (run.err.trim()) console.error(run.err.trim());
	process.exit(1);
}

console.log("o create cli validation passed");
