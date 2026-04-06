import { sendJson } from "@/app/api/_lib/json";

const cache = "no-store";

export function GET(request: Request) {
  return sendJson(request, { status: "ok" }, cache);
}
