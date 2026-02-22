import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const bin = join(root, "packages", "create-fromsrc", "dist", "index.js");
const defaults = ["next.js", "react-router", "astro", "remix"];
const requested = process.argv.slice(2);
const frameworks = requested.length > 0 ? requested : defaults;

function run(cmd, args, cwd) {
	return new Promise((resolve) => {
		const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
		let out = "";
		let err = "";
		child.stdout.on("data", (chunk) => {
			out += String(chunk);
		});
		child.stderr.on("data", (chunk) => {
			err += String(chunk);
		});
		child.on("close", (code) => resolve({ code, out, err }));
	});
}

const work = await mkdtemp(join(tmpdir(), "fromsrc-scaffold-smoke-"));
const issues = [];

try {
	for (const framework of frameworks) {
		const name = `smoke-${framework}`;
		const create = await run("node", [bin, "--name", name, "--framework", framework, "--yes"], work);
		if (create.code !== 0) {
			issues.push(`${framework}: scaffold failed`);
			if (create.out.trim()) console.error(create.out.trim());
			if (create.err.trim()) console.error(create.err.trim());
			continue;
		}

		const target = join(work, name);
		const install = await run("bun", ["install"], target);
		if (install.code !== 0) {
			issues.push(`${framework}: bun install failed`);
			if (install.out.trim()) console.error(install.out.trim());
			if (install.err.trim()) console.error(install.err.trim());
			continue;
		}

		const typecheck = await run("bun", ["run", "typecheck"], target);
		if (typecheck.code !== 0) {
			issues.push(`${framework}: bun run typecheck failed`);
			if (typecheck.out.trim()) console.error(typecheck.out.trim());
			if (typecheck.err.trim()) console.error(typecheck.err.trim());
			continue;
		}

		const build = await run("bun", ["run", "build"], target);
		if (build.code !== 0) {
			issues.push(`${framework}: bun run build failed`);
			if (build.out.trim()) console.error(build.out.trim());
			if (build.err.trim()) console.error(build.err.trim());
			continue;
		}

		console.log(`o ${framework}: smoke passed`);
	}
} finally {
	await rm(work, { recursive: true, force: true });
}

if (issues.length > 0) {
	console.error("x scaffold smoke validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o scaffold smoke validation passed (${frameworks.length} frameworks)`);
