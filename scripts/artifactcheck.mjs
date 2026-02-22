import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, ".gitignore");
const ignore = await readFile(file, "utf8");
const required = [".dev.log", ".dev.pid"];
const issues = [];

for (const name of required) {
	if (!ignore.split("\n").map((line) => line.trim()).includes(name)) {
		issues.push(`.gitignore missing ${name}`);
	}
	const tracked = Bun.spawnSync(["git", "ls-files", "--error-unmatch", name], {
		cwd: root,
		stdout: "ignore",
		stderr: "ignore",
	});
	if (tracked.exitCode === 0) {
		issues.push(`tracked artifact file: ${name}`);
	}
}

if (issues.length > 0) {
	console.error("x artifact validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o artifact validation passed (${required.length} files)`);
