#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const SERVER_CMD = process.env.TEST_SERVER_CMD || "npm run dev";
const SERVER_TIMEOUT_MS = Number(process.env.TEST_SERVER_TIMEOUT_MS ?? 60000);
const env = loadEnv();
for (const [key, value] of Object.entries(env)) {
  if (value && !process.env[key]) {
    process.env[key] = value;
  }
}
const username = process.env.ADMIN_USERNAME || env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || env.ADMIN_TOKEN || "admin12345";
const email = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || `${username}@example.com`;

let cookie = "";
let serverProcess = null;
let cleanupHook = async () => {};

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    cleanupHook()
      .catch((err) => console.error("Failed to clean up dev server:", err))
      .finally(() => {
        process.exit(signal === "SIGINT" ? 130 : 143);
      });
  });
});

async function main() {
  console.log(">>> Running auth smoke against", BASE_URL);
  const cleanup = await ensureServerRunning();
  cleanupHook = cleanup;
  try {
    await maybeRegister();
    await login();
    await checkSession(200);
    await createTerm();
    await logout();
    await checkSession(401);
    console.log(">>> Auth smoke completed successfully");
  } finally {
    await cleanup();
    cleanupHook = async () => {};
  }
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

async function ensureServerRunning() {
  if (await isServerReady()) {
    console.log(">>> Detected running server, reusing it");
    return async () => {};
  }

  console.log(">>> Starting dev server with:", SERVER_CMD);
  serverProcess = spawn(SERVER_CMD, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });

  let serverExitError;
  const exitPromise = new Promise((resolve, reject) => {
    serverProcess.on("exit", (code, signal) => {
      if (code === 0 || signal === "SIGTERM") {
        resolve();
      } else {
        serverExitError = new Error(`Dev server exited early with code ${code ?? "null"} signal ${signal ?? "null"}`);
        reject(serverExitError);
      }
    });
    serverProcess.on("error", (err) => {
      serverExitError = err;
      reject(err);
    });
  });
  exitPromise.catch(() => {});

  await waitForServerReady(() => serverExitError);

  return async () => {
    if (serverProcess) {
      console.log(">>> Stopping dev server");
      serverProcess.kill("SIGTERM");
      try {
        await exitPromise;
      } catch (err) {
        console.error("Dev server exited with error:", err.message || err);
      }
      serverProcess = null;
    }
  };
}

async function isServerReady() {
  try {
    const res = await fetch(new URL("/api/auth", BASE_URL), { method: "GET" });
    return res.status >= 200 && res.status < 600;
  } catch {
    return false;
  }
}

async function waitForServerReady(getExitError) {
  const start = Date.now();
  while (Date.now() - start < SERVER_TIMEOUT_MS) {
    if (await isServerReady()) {
      return;
    }
    if (serverProcess && (serverProcess.exitCode != null || serverProcess.signalCode != null)) {
      const exitError = typeof getExitError === "function" ? getExitError() : null;
      throw exitError || new Error("Dev server exited before becoming ready. Check the server output above for details.");
    }
    await delay(1000);
  }
  throw new Error(`Timed out after ${SERVER_TIMEOUT_MS}ms waiting for dev server`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
