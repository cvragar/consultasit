import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("PWA cache release", () => {
  it("uses a new cache version and activates it immediately", () => {
    const serviceWorker = fs.readFileSync(
      path.resolve(import.meta.dirname, "../client/public/sw.js"),
      "utf8",
    );

    expect(serviceWorker).toContain('const CACHE_NAME = "consultesit-v3"');
    expect(serviceWorker).toContain("self.skipWaiting()");
    expect(serviceWorker).toContain("self.clients.claim()");
  });
});
