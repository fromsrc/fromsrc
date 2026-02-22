import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const files = {
	rpc: join(root, "app", "api", "mcp", "rpc.ts"),
	ops: join(root, "app", "api", "mcp", "ops.ts"),
	manifest: join(root, "packages", "fromsrc", "src", "mcp.ts"),
	docs: join(root, "docs", "ai.mdx"),
};

const needed = [
	"initialize",
	"notifications/initialized",
	"ping",
	"search_docs",
	"get_page",
	"list_pages",
	"tools/list",
	"tools/call",
	"resources/list",
	"resources/templates/list",
	"resources/read",
];

function unique(values) {
	return [...new Set(values)];
}

function parseenum(text) {
	const block = text.match(/methodname\s*=\s*z\.enum\(\[([\s\S]*?)\]\)/);
	if (!block) return [];
	return unique([...block[1].matchAll(/"([^"]+)"/g)].map((item) => item[1] ?? ""));
}

function parsecases(text) {
	return unique([...text.matchAll(/case\s+"([^"]+)"/g)].map((item) => item[1] ?? ""));
}

function missing(source, target) {
	return target.filter((item) => !source.includes(item));
}

const issues = [];

const [rpc, ops, manifest, docs] = await Promise.all([
	readFile(files.rpc, "utf8"),
	readFile(files.ops, "utf8"),
	readFile(files.manifest, "utf8"),
	readFile(files.docs, "utf8"),
]);

const enumlist = parseenum(rpc);
const caselist = parsecases(ops);
const enummiss = missing(enumlist, needed);
const casemiss = missing(caselist, needed);
if (enummiss.length > 0) issues.push(`rpc methods missing: ${enummiss.join(", ")}`);
if (casemiss.length > 0) issues.push(`ops handlers missing: ${casemiss.join(", ")}`);

for (const name of needed) {
	const mark = `- \`${name}\``;
	if (!docs.includes(mark)) issues.push(`docs method missing: ${name}`);
}

if (!manifest.includes("resources:")) issues.push("manifest resources capability missing");
if (!manifest.includes("listChanged: false")) issues.push("manifest listChanged missing");
if (!ops.includes("fromsrc://docs/{slug}")) issues.push("resource template missing");
if (!rpc.includes("export const slug =")) issues.push("slug schema missing");
if (!rpc.includes("[a-z0-9_-]")) issues.push("slug schema missing underscore support");
if (!rpc.includes("export const page = z.object({ slug })")) issues.push("page schema not bound to slug schema");

if (issues.length > 0) {
	console.error("x mcp contract validation failed");
	for (const issue of issues) console.error(issue);
	process.exit(1);
}

console.log(`o mcp contract validation passed (${needed.length} methods)`);
