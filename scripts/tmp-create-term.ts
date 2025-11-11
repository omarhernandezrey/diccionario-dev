import { NextRequest } from "next/server";
import { POST } from "@/app/api/terms/route";
import { signJwt } from "@/lib/auth";

async function main() {
  const token = signJwt({ id: 1, username: "debug", role: "admin" });
  const headers = new Headers({
    "content-type": "application/json",
    cookie: `admin_token=${token}`,
  });
  const body = {
    term: `no-translation-${Date.now()}`,
    translation: "",
    aliases: [],
    category: "general" as const,
    meaning: "meaning",
    what: "what",
    how: "how",
    examples: [],
  };
  const req = new NextRequest("http://localhost/api/terms", { method: "POST", headers, body: JSON.stringify(body) });
  const res = await POST(req);
  console.log(res.status, await res.json());
}

main();
