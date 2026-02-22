import { readFile } from "node:fs/promises";
import { join } from "node:path";
import net from "node:net";

const root = process.cwd();
const logfile = join(root, ".dev.log");

const rawcount = process.argv[2] || "80";
const count = Number(rawcount);
const size = Number.isFinite(count) && count > 0 ? Math.floor(count) : 80;
const rawport = process.env.PORT || "3000";
const port = Number(rawport);

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

async function readpid() {
	try {
		const raw = (await readFile(join(root, ".dev.pid"), "utf8")).trim();
		const pid = Number(raw);
		if (!Number.isFinite(pid) || pid <= 0) return null;
		return pid;
	} catch {
		return null;
	}
}

const pid = await readpid();
const busy = Number.isFinite(port) && port > 0 ? await listen(port) : false;
if (!pid && busy) {
	console.log("o external dev process");
	process.exit(0);
}

try {
	const text = await readFile(logfile, "utf8");
	const lines = text.split("\n");
	const tail = lines.slice(-size);
	for (const line of tail) {
		if (line.length > 0) console.log(line);
	}
} catch {
	console.log("o no log");
}
