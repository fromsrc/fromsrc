export function firstline(text) {
	return (text.split("\n", 1).at(0) ?? "").trim();
}

export function isclientdirective(text) {
	return /^['"]use client['"];?$/.test(firstline(text));
}
