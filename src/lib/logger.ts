import pino from "pino";

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const level = process.env.LOG_LEVEL ?? (isProd ? "info" : "debug");

export const logger = pino({
  level,
  base: {
    env: process.env.NODE_ENV ?? "development",
    service: process.env.SERVICE_NAME ?? "diccionario-dev",
  },
  redact: {
    remove: true,
    paths: [
      "password",
      "*.password",
      "*.token",
      "*.secret",
      "*.authorization",
      "headers.authorization",
      "headers.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "cookies",
      "cookie",
    ],
  },
});

const counters = new Map<string, number>();

export function incrementMetric(name: string, value = 1) {
  const next = (counters.get(name) ?? 0) + value;
  counters.set(name, next);
  if (!isTest) {
    logger.debug({ metric: name, value: next }, "metric.increment");
  }
  return next;
}

export function getMetricsSnapshot() {
  return Object.fromEntries(counters.entries());
}
