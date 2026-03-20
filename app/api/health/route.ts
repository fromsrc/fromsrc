import { sendjson } from "@/app/api/_lib/json";

const cache = "no-store";

export function GET(request: Request) {
  return sendjson(request, { status: "ok" }, cache);
}
