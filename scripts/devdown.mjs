import { unlink } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const pidfile = join(root, ".dev.pid");

async function readpid() {
	try {
		const raw = (await readFile(pidfile, "utf8")).trim();
		const pid = Number(raw);
		if (!Number.isFinite(pid) || pid <= 0) return null;
		return pid;
	} catch {
		return null;
	}
}

function stop(pid) {
	try {
		process.kill(pid, "SIGTERM");
		return true;
	} catch {
		return false;
	}
}

const pid = await readpid();
if (!pid) {
	console.log("o no pid");
	process.exit(0);
}

if (stop(pid)) {
	console.log(`o dev stopped (${pid})`);
} else {
	console.log(`o dev missing (${pid})`);
}

try {
	await unlink(pidfile);
} catch {}
