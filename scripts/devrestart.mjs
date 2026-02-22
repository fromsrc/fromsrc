import { spawnSync } from "node:child_process";

function run(args) {
	const result = spawnSync("bun", args, {
		stdio: "inherit",
		env: process.env,
	});
	return result.status ?? 1;
}

const stop = run(["run", "dev:down"]);
if (stop !== 0) process.exit(stop);

const start = run(["run", "dev:up"]);
if (start !== 0) process.exit(start);

process.exit(0);
