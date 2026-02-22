import { readFile } from "node:fs/promises";
import { join } from "node:path";
import net from "node:net";

const root = process.cwd();
const pidfile = join(root, ".dev.pid");
const logfile = join(root, ".dev.log");
const rawport = process.env.PORT || "3000";
const port = Number(rawport);

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

function listen(target) {
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
		socket.connect(target, "127.0.0.1");
	});
}

function external(target) {
	const ids = Bun.spawnSync(["lsof", "-nP", `-iTCP:${target}`, "-sTCP:LISTEN", "-t"], {
		stdout: "pipe",
		stderr: "ignore",
	});
	if (ids.exitCode !== 0) return null;
	const pid = ids.stdout.toString().trim().split("\n").find(Boolean);
	if (!pid) return null;
	const info = Bun.spawnSync(["ps", "-p", pid, "-o", "comm="], {
		stdout: "pipe",
		stderr: "ignore",
	});
	const cmd = info.exitCode === 0 ? info.stdout.toString().trim() : "";
	return { pid, cmd };
}

const pid = await readpid();
const run = pid ? alive(pid) : false;
const busy = Number.isFinite(port) && port > 0 ? await listen(port) : false;

if (pid && run) {
	console.log(`o pid ${pid} alive`);
} else if (pid) {
	console.log(`o pid ${pid} stale`);
} else {
	console.log("o no pid");
}

if (Number.isFinite(port) && port > 0) {
	console.log(busy ? `o port ${port} open` : `o port ${port} closed`);
	if (!pid && busy) {
		const ext = external(port);
		if (ext?.cmd) {
			console.log(`o external ${ext.pid} ${ext.cmd}`);
		} else if (ext?.pid) {
			console.log(`o external ${ext.pid}`);
		}
	}
}

if (!pid && busy) process.exit(0);

try {
	const log = await readFile(logfile, "utf8");
	const lines = log.trim().split("\n").filter(Boolean);
	const tail = lines.slice(-5);
	if (tail.length > 0) {
		console.log("o log tail");
		for (const line of tail) console.log(line);
	} else {
		console.log("o log empty");
	}
} catch {
	console.log("o no log");
}
