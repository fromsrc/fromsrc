import { openSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import net from "node:net";

const root = process.cwd();
const pidfile = join(root, ".dev.pid");
const logfile = join(root, ".dev.log");

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

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function listen(port) {
	return new Promise((resolve) => {
		const socket = new net.Socket();
		const done = (value) => {
			socket.removeAllListeners();
			socket.destroy();
			resolve(value);
		};
		socket.setTimeout(250);
		socket.once("connect", () => done(true));
		socket.once("error", () => done(false));
		socket.once("timeout", () => done(false));
		socket.connect(port, "127.0.0.1");
	});
}

const existing = await readpid();
if (existing && alive(existing)) {
	console.log(`o dev already running (${existing})`);
	process.exit(0);
}
if (existing && !alive(existing)) {
	try {
		await unlink(pidfile);
	} catch {}
}

const rawport = process.env.PORT || "3000";
const port = Number(rawport);
if (Number.isFinite(port) && port > 0) {
	const busy = await listen(port);
	if (busy) {
		console.log(`o port busy (${port})`);
		process.exit(0);
	}
}

const fd = openSync(logfile, "w");
const child = spawn("bun", ["run", "dev"], {
	cwd: root,
	detached: true,
	stdio: ["ignore", fd, fd],
	env: process.env,
});

child.unref();
await sleep(350);
if (!alive(child.pid)) {
	console.log("x dev failed");
	process.exit(1);
}
await writeFile(pidfile, `${child.pid}\n`, "utf8");
console.log(`o dev started (${child.pid})`);
