import { localSearch } from "fromsrc";
import { getSearchDocs } from "../app/docs/_lib/content";

const docs = await getSearchDocs();
const queries = [
	"routing cache invalidation",
	"openapi schema",
	"keyboard navigation",
	"json ld sitemap",
	"content collection type generation",
];
const measures = [];

for (let index = 0; index < 10; index++) {
	for (const query of queries) {
		await localSearch.search(query, docs, 8);
	}
}

for (let index = 0; index < 40; index++) {
	for (const query of queries) {
		const started = performance.now();
		await localSearch.search(query, docs, 8);
		measures.push(performance.now() - started);
	}
}

const sorted = measures.toSorted((left, right) => left - right);
const pick = (value) => sorted[Math.min(sorted.length - 1, Math.max(0, value))];
const median = pick(Math.floor(sorted.length / 2));
const p95 = pick(Math.ceil(sorted.length * 0.95) - 1);
const max = sorted[sorted.length - 1];
const avg = sorted.reduce((total, value) => total + value, 0) / sorted.length;
const p95limit = 20;
const maxlimit = 40;

if (p95 > p95limit || max > maxlimit) {
	console.error("x search perf contract validation failed");
	console.error(`docs: ${docs.length}`);
	console.error(`median: ${median.toFixed(2)}ms`);
	console.error(`p95: ${p95.toFixed(2)}ms (max ${p95limit}ms)`);
	console.error(`max: ${max.toFixed(2)}ms (max ${maxlimit}ms)`);
	console.error(`avg: ${avg.toFixed(2)}ms`);
	process.exit(1);
}

console.log(
	`o search perf validation passed (docs ${docs.length}, median ${median.toFixed(2)}ms, p95 ${p95.toFixed(2)}ms, max ${max.toFixed(2)}ms, avg ${avg.toFixed(2)}ms)`,
);
