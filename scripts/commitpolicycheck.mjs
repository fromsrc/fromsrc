const root = process.cwd();

const blocked = new Set([
	".dev.log",
	".dev.pid",
	"PLAN.md",
	"RESEARCH.md",
	"pr.md",
	"PR.md",
	"CLAUDE.md",
]);

function lines(text) {
	return text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function run(args) {
	const out = Bun.spawnSync(["git", ...args], {
		cwd: root,
		stdout: "pipe",
		stderr: "ignore",
	});
	if (out.exitCode !== 0) return [];
	return lines(out.stdout.toString());
}

const hasparent = Bun.spawnSync(["git", "rev-parse", "--verify", "HEAD^"], {
	cwd: root,
	stdout: "ignore",
	stderr: "ignore",
}).exitCode === 0;

const changed = hasparent
	? run(["diff", "--name-only", "HEAD^", "HEAD"])
	: run(["show", "--name-only", "--pretty=", "HEAD"]);

const issues = changed.filter((file) => blocked.has(file));

if (issues.length > 0) {
	console.error("x commit policy validation failed");
	for (const file of issues) console.error(`blocked file changed in HEAD: ${file}`);
	process.exit(1);
}

console.log(`o commit policy validation passed (${changed.length} files in HEAD)`);
