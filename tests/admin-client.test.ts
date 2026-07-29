import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAdminClient } from "../lib/admin/client";
import { createAdminServer } from "../scripts/admin-server";

let rootDir: string;
let server: ReturnType<typeof createAdminServer>;
let baseUrl: string;

beforeEach(async () => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "klay-admin-client-"));
  fs.mkdirSync(path.join(rootDir, "content", "posts"), { recursive: true });
  for (const fileName of [
    "profile.json",
    "experience.json",
    "projects.json",
    "skills.json",
    "home-sections.json",
  ]) {
    fs.copyFileSync(
      path.join(process.cwd(), "content", fileName),
      path.join(rootDir, "content", fileName),
    );
  }

  server = createAdminServer({ rootDir });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe("admin API client", () => {
  it("reads the unified response and sends the mutation header", async () => {
    const browserLikeFetch: typeof fetch = (input, init = {}) =>
      fetch(input, {
        ...init,
        headers: {
          ...Object.fromEntries(new Headers(init.headers).entries()),
          Origin: "http://localhost:3000",
        },
      });
    const client = createAdminClient({ baseUrl, fetchImpl: browserLikeFetch });

    const loaded = await client.loadData();
    expect(loaded.profile.name).toBeTruthy();

    await client.save("profile", {
      ...loaded.profile,
      summary: "Saved through the client",
    });

    const saved = JSON.parse(
      fs.readFileSync(path.join(rootDir, "content", "profile.json"), "utf8"),
    );
    expect(saved.summary).toBe("Saved through the client");
  });

  it("exposes the structured server error message", async () => {
    const browserLikeFetch: typeof fetch = (input, init = {}) =>
      fetch(input, {
        ...init,
        headers: {
          ...Object.fromEntries(new Headers(init.headers).entries()),
          Origin: "http://localhost:3000",
        },
      });
    const client = createAdminClient({ baseUrl, fetchImpl: browserLikeFetch });

    await expect(client.save("profile", { name: "invalid" })).rejects.toThrow(
      /validation/i,
    );
  });
});
