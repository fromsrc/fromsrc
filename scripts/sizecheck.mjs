import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const list = [
	{
		name: "readtime",
		code: "import { calcReadTime } from 'fromsrc/readtime'; export default calcReadTime('a b c');",
		max: 400,
	},
	{
		name: "searchscore",
		code: "import { scoreterms, termindex } from 'fromsrc/searchscore'; const data={title:'intro',slug:'/intro',description:'d',content:'text',titleindex:termindex(['intro']),slugindex:termindex(['intro']),descriptionindex:termindex(['d']),headingindex:termindex(['intro']),contentindex:termindex(['text'])}; export default scoreterms(['intro'],data);",
		max: 1500,
	},
	{
		name: "searchindex",
		code: "import { addDocument, createIndex, search } from 'fromsrc/searchindex'; const index=createIndex(); addDocument(index,{path:'/a',title:'a',headings:['h'],content:'body'}); export default search(index,'a');",
		max: 4000,
	},
	{
		name: "llms",
		code: "import { generateLlmsIndex } from 'fromsrc/llms'; export default generateLlmsIndex({title:'a',description:'b',baseUrl:'https://x.y'},[{title:'t',slug:'s'}]);",
		max: 1000,
	},
];

const root = await mkdtemp(join(process.cwd(), ".size-"));
let fail = false;

try {
	for (const item of list) {
		const file = join(root, `${item.name}.ts`);
		await writeFile(file, item.code, "utf8");
		const res = await Bun.build({
			entrypoints: [file],
			format: "esm",
			target: "browser",
			minify: true,
			treeShaking: true,
			write: false,
		});

		if (!res.success) {
			for (const log of res.logs) {
				console.error(log.message);
			}
			throw new Error(`bundle failed: ${item.name}`);
		}

		const out = res.outputs.find((entry) => entry.path.endsWith(".js"));
		if (!out) {
			throw new Error(`missing output: ${item.name}`);
		}

		const size = out.size;
		const line = `${item.name}: ${size}b (max ${item.max}b)`;
		if (size > item.max) {
			fail = true;
			console.error(`x ${line}`);
		} else {
			console.log(`o ${line}`);
		}
	}
} finally {
	await rm(root, { recursive: true, force: true });
}

if (fail) {
	process.exit(1);
}
