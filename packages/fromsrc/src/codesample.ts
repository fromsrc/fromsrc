export type CodeLanguage = "javascript" | "python" | "curl" | "go" | "ruby" | "php"

export type CodeSampleConfig = {
	method: string
	url: string
	headers?: Record<string, string>
	body?: unknown
	auth?: { type: "bearer" | "apikey" | "basic"; value: string }
}

export type CodeSample = { language: CodeLanguage; label: string; code: string }

const labels: Record<CodeLanguage, string> = {
	javascript: "JavaScript",
	python: "Python",
	curl: "cURL",
	go: "Go",
	ruby: "Ruby",
	php: "PHP",
}

const allLanguages: CodeLanguage[] = ["javascript", "python", "curl", "go", "ruby", "php"]

function authHeader(auth: CodeSampleConfig["auth"]): Record<string, string> {
	if (!auth) return {}
	if (auth.type === "bearer") return { Authorization: `Bearer ${auth.value}` }
	if (auth.type === "apikey") return { "X-API-Key": auth.value }
	return { Authorization: `Basic ${btoa(auth.value)}` }
}

function merged(config: CodeSampleConfig): Record<string, string> {
	return { ...config.headers, ...authHeader(config.auth) }
}

function javascript(c: CodeSampleConfig): string {
	const h = merged(c)
	const opts: string[] = [`\tmethod: "${c.method}"`]
	if (Object.keys(h).length > 0) {
		const e = Object.entries(h).map(([k, v]) => `\t\t"${k}": "${v}"`).join(",\n")
		opts.push(`\theaders: {\n${e}\n\t}`)
	}
	if (c.body) opts.push(`\tbody: JSON.stringify(${JSON.stringify(c.body)})`)
	return `const response = await fetch("${c.url}", {\n${opts.join(",\n")}\n})\nconst data = await response.json()`
}

function python(c: CodeSampleConfig): string {
	const h = merged(c)
	const lines = ["import requests", ""]
	const args = [`"${c.url}"`]
	if (Object.keys(h).length > 0) {
		const e = Object.entries(h).map(([k, v]) => `\t"${k}": "${v}"`).join(",\n")
		lines.push(`headers = {\n${e}\n}`)
		args.push("headers=headers")
	}
	if (c.body) { lines.push(`data = ${JSON.stringify(c.body)}`); args.push("json=data") }
	lines.push(`response = requests.${c.method.toLowerCase()}(${args.join(", ")})`)
	return lines.join("\n")
}

function curl(c: CodeSampleConfig): string {
	const h = merged(c)
	const parts = [`curl -X ${c.method} "${c.url}"`]
	for (const [k, v] of Object.entries(h)) parts.push(`  -H "${k}: ${v}"`)
	if (c.body) parts.push(`  -d '${JSON.stringify(c.body)}'`)
	return parts.join(" \\\n")
}

function go(c: CodeSampleConfig): string {
	const h = merged(c)
	const body = c.body ? `bytes.NewBuffer([]byte(\`${JSON.stringify(c.body)}\`))` : "nil"
	const lines = [`req, err := http.NewRequest("${c.method}", "${c.url}", ${body})`]
	for (const [k, v] of Object.entries(h)) lines.push(`req.Header.Set("${k}", "${v}")`)
	lines.push("client := &http.Client{}", "resp, err := client.Do(req)")
	return lines.join("\n")
}

function ruby(c: CodeSampleConfig): string {
	const h = merged(c)
	const uri = new URL(c.url)
	const cap = c.method[0]!.toUpperCase() + c.method.slice(1).toLowerCase()
	const lines = [
		'require "net/http"', 'require "json"', "",
		`uri = URI("${c.url}")`,
		`http = Net::HTTP.new("${uri.hostname}", ${uri.port})`,
	]
	if (uri.protocol === "https:") lines.push("http.use_ssl = true")
	lines.push(`request = Net::HTTP::${cap}.new(uri)`)
	for (const [k, v] of Object.entries(h)) lines.push(`request["${k}"] = "${v}"`)
	if (c.body) lines.push(`request.body = ${JSON.stringify(c.body)}.to_json`)
	lines.push("response = http.request(request)")
	return lines.join("\n")
}

function php(c: CodeSampleConfig): string {
	const h = merged(c)
	const hl = Object.entries(h).map(([k, v]) => `${k}: ${v}`).join("\\r\\n")
	const opts = [`\t"method" => "${c.method}"`]
	if (hl) opts.push(`\t"header" => "${hl}"`)
	if (c.body) opts.push(`\t"content" => json_encode(${JSON.stringify(c.body)})`)
	return [
		`$context = stream_context_create(["http" => [`,
		opts.join(",\n"),
		"]]);",
		`$response = file_get_contents("${c.url}", false, $context);`,
		"$data = json_decode($response, true);",
	].join("\n")
}

const generators: Record<CodeLanguage, (c: CodeSampleConfig) => string> = {
	javascript, python, curl, go, ruby, php,
}

export function generateSample(config: CodeSampleConfig, language: CodeLanguage): CodeSample {
	return { language, label: labels[language], code: generators[language](config) }
}

export function generateSamples(
	config: CodeSampleConfig,
	languages: CodeLanguage[] = allLanguages,
): CodeSample[] {
	return languages.map((lang) => generateSample(config, lang))
}
