import { readFile, unlink } from "node:fs/promises";
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

function alive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function signal(pid, value) {
	try {
		process.kill(pid, value);
		return true;
	} catch {
		return false;
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const pid = await readpid();
if (!pid) {
	console.log("o no pid");
	process.exit(0);
}

if (!alive(pid)) {
	console.log(`o dev missing (${pid})`);
	try {
		await unlink(pidfile);
	} catch {}
	process.exit(0);
}

signal(pid, "SIGTERM");
for (let index = 0; index < 10; index++) {
	await sleep(100);
	if (!alive(pid)) {
		console.log(`o dev stopped (${pid})`);
		try {
			await unlink(pidfile);
		} catch {}
		process.exit(0);
	}
}

if (signal(pid, "SIGKILL")) {
	console.log(`o dev killed (${pid})`);
} else {
	console.log(`o dev missing (${pid})`);
}

try {
	await unlink(pidfile);
} catch {}
