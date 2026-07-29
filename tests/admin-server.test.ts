import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createAdminServer } from "../scripts/admin-server";

const ALLOWED_ORIGIN = "http://localhost:3000";
const ADMIN_HEADER = { "X-Klay-Admin": "1" };

let rootDir: string;
let server: ReturnType<typeof createAdminServer>;
let baseUrl: string;

function copyFixture(fileName: string) {
  fs.copyFileSync(
    path.join(process.cwd(), "content", fileName),
    path.join(rootDir, "content", fileName),
  );
}

async function startServer(options: Parameters<typeof createAdminServer>[0] = {}) {
  server = createAdminServer({ rootDir, ...options });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
}

async function stopServer() {
  if (!server?.listening) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "klay-admin-test-"));
  fs.mkdirSync(path.join(rootDir, "content", "posts"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "public", "images", "uploads"), {
    recursive: true,
  });
  [
    "profile.json",
    "experience.json",
    "projects.json",
    "skills.json",
    "home-sections.json",
  ].forEach(copyFixture);
});

afterEach(async () => {
  await stopServer();
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe("local admin server", () => {
  test("reports health without exposing content", async () => {
    await startServer();

    const response = await fetch(`${baseUrl}/api/admin/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { service: "klay-admin", version: 1 },
    });
  });

  test("allows configured localhost origins and rejects foreign origins", async () => {
    await startServer();

    const allowed = await fetch(`${baseUrl}/api/admin/load-data`, {
      headers: { Origin: ALLOWED_ORIGIN },
    });
    const blocked = await fetch(`${baseUrl}/api/admin/load-data`, {
      headers: { Origin: "https://attacker.example" },
    });

    expect(allowed.status).toBe(200);
    expect(allowed.headers.get("access-control-allow-origin")).toBe(ALLOWED_ORIGIN);
    expect((await allowed.json()).success).toBe(true);
    expect(blocked.status).toBe(403);
    expect(await blocked.json()).toMatchObject({
      success: false,
      error: { code: "ORIGIN_FORBIDDEN" },
    });
  });

  test("requires the admin header before mutating files", async () => {
    await startServer();
    const profilePath = path.join(rootDir, "content", "profile.json");
    const before = fs.readFileSync(profilePath, "utf8");

    const response = await fetch(`${baseUrl}/api/admin/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ALLOWED_ORIGIN,
      },
      body: JSON.stringify({
        type: "profile",
        data: JSON.parse(before),
      }),
    });

    expect(response.status).toBe(403);
    expect(fs.readFileSync(profilePath, "utf8")).toBe(before);
  });

  test("validates content before replacing a file atomically", async () => {
    await startServer();
    const profilePath = path.join(rootDir, "content", "profile.json");
    const current = JSON.parse(fs.readFileSync(profilePath, "utf8"));
    const updated = { ...current, summary: "Updated safely" };

    const validResponse = await fetch(`${baseUrl}/api/admin/save`, {
      method: "POST",
      headers: {
        ...ADMIN_HEADER,
        "Content-Type": "application/json",
        Origin: ALLOWED_ORIGIN,
      },
      body: JSON.stringify({ type: "profile", data: updated }),
    });

    expect(validResponse.status).toBe(200);
    expect(JSON.parse(fs.readFileSync(profilePath, "utf8")).summary).toBe(
      "Updated safely",
    );
    expect(
      fs.readdirSync(path.dirname(profilePath)).some((name) => name.includes(".tmp-")),
    ).toBe(false);

    const beforeInvalid = fs.readFileSync(profilePath, "utf8");
    const invalidResponse = await fetch(`${baseUrl}/api/admin/save`, {
      method: "POST",
      headers: {
        ...ADMIN_HEADER,
        "Content-Type": "application/json",
        Origin: ALLOWED_ORIGIN,
      },
      body: JSON.stringify({
        type: "profile",
        data: { ...updated, privatePhone: "secret" },
      }),
    });

    expect(invalidResponse.status).toBe(400);
    expect(await invalidResponse.json()).toMatchObject({
      success: false,
      error: { code: "VALIDATION_FAILED" },
    });
    expect(fs.readFileSync(profilePath, "utf8")).toBe(beforeInvalid);
  });

  test("rejects oversized save requests before changing files", async () => {
    await startServer({ maxSaveBytes: 100 });
    const profilePath = path.join(rootDir, "content", "profile.json");
    const before = fs.readFileSync(profilePath, "utf8");

    const response = await fetch(`${baseUrl}/api/admin/save`, {
      method: "POST",
      headers: {
        ...ADMIN_HEADER,
        "Content-Type": "application/json",
        Origin: ALLOWED_ORIGIN,
      },
      body: JSON.stringify({ type: "profile", data: JSON.parse(before) }),
    });

    expect(response.status).toBe(413);
    expect(fs.readFileSync(profilePath, "utf8")).toBe(before);
  });

  test("converts a verified image upload to bounded WebP", async () => {
    await startServer();
    const png = await sharp({
      create: {
        width: 2000,
        height: 1000,
        channels: 3,
        background: "#336699",
      },
    })
      .png()
      .toBuffer();

    const response = await fetch(`${baseUrl}/api/admin/upload`, {
      method: "POST",
      headers: {
        ...ADMIN_HEADER,
        "Content-Type": "application/json",
        Origin: ALLOWED_ORIGIN,
      },
      body: JSON.stringify({
        fileName: "large.png",
        fileData: `data:image/png;base64,${png.toString("base64")}`,
      }),
    });
    const payload = await response.json();
    const outputPath = path.join(rootDir, "public", payload.data.url);
    const metadata = await sharp(outputPath).metadata();

    expect(response.status).toBe(200);
    expect(payload.data.url).toMatch(/^\/images\/uploads\/\d+-large\.webp$/);
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(1600);
    expect(metadata.height).toBe(800);
  });

  test("rejects a fake image without writing a file", async () => {
    await startServer();

    const response = await fetch(`${baseUrl}/api/admin/upload`, {
      method: "POST",
      headers: {
        ...ADMIN_HEADER,
        "Content-Type": "application/json",
        Origin: ALLOWED_ORIGIN,
      },
      body: JSON.stringify({
        fileName: "fake.png",
        fileData: `data:image/png;base64,${Buffer.from("not an image").toString("base64")}`,
      }),
    });

    expect(response.status).toBe(400);
    expect(fs.readdirSync(path.join(rootDir, "public", "images", "uploads"))).toEqual(
      [],
    );
  });
});
