#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const env = loadEnv();
const username = process.env.ADMIN_USERNAME || env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || env.ADMIN_TOKEN || "admin12345";
const email = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || `${username}@example.com`;

let cookie = "";

async function main() {
  console.log(">>> Running auth smoke against", BASE_URL);
  await maybeRegister();
  await login();
  await checkSession(200);
  await createTerm();
  await logout();
  await checkSession(401);
  console.log(">>> Auth smoke completed successfully");
}

async function maybeRegister() {
  console.log("-> Register (if allowed)");
  const res = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, email }),
  });
  if (res.status === 201) {
    console.log("   Registered new admin");
    setCookieFrom(res);
  } else if (res.status === 409 || res.status === 403 || res.status === 401) {
    console.log(`   Skipping register (${res.status})`);
  } else {
    throw new Error(`Register failed: ${res.status} ${await res.text()}`);
  }
}

async function login() {
  console.log("-> Login");
  const res = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  }
  setCookieFrom(res);
  console.log("   Logged in as", username);
}

async function checkSession(expected) {
  console.log("-> Check session (expect", expected, ")");
  const res = await request("/api/auth", { method: "GET" }, true);
  if (res.status !== expected) {
    throw new Error(`Session check failed: expected ${expected}, got ${res.status}`);
  }
  console.log("   Status", res.status);
}

async function createTerm() {
  console.log("-> Create protected term");
  const unique = `auth-term-${Date.now()}`;
  const res = await request(
    "/api/terms",
    {
      method: "POST",
      body: JSON.stringify({
        term: unique,
        aliases: [],
        category: "general",
        meaning: "Smoke test term",
        what: "Comprueba que la API protegida funciona",
        how: "Solo para pruebas automáticas",
        examples: [],
      }),
    },
    true,
  );
  if (res.status !== 201) {
    throw new Error(`Protected endpoint failed: ${res.status} ${await res.text()}`);
  }
  console.log("   Created term", unique);
}

async function logout() {
  console.log("-> Logout");
  const res = await request("/api/auth", { method: "DELETE" }, true);
  if (res.status !== 200) {
    throw new Error(`Logout failed: ${res.status}`);
  }
  cookie = "";
}

async function request(urlPath, options = {}, useCookie = false) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (useCookie && cookie) {
    headers.Cookie = cookie;
  }
  const res = await fetch(new URL(urlPath, BASE_URL), {
    ...options,
    headers,
  });
  return res;
}

function setCookieFrom(res) {
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    cookie = setCookie.split(",")[0];
  }
}

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  return fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      if (line.startsWith("#") || !line.includes("=")) return acc;
      const [key, ...rest] = line.split("=");
      acc[key.trim()] = rest.join("=").replace(/^"+|"+$/g, "");
      return acc;
    }, {});
}

main().catch((err) => {
  console.error("Auth smoke failed:", err.message || err);
  process.exitCode = 1;
});
