import { sendjson } from "@/app/api/_lib/json"

const cache = "no-store"

export async function GET(request: Request) {
	return sendjson(request, { status: "ok" }, cache)
}
