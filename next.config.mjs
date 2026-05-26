import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";

// Self-healing dev-server startup in development mode
if (process.env.NODE_ENV === "development") {
  const checkReq = http.get("http://localhost:8081/api/admin/load-data", (res) => {
    // Port 8081 is already active
  });
  checkReq.on("error", () => {
    console.log("[Klay Studio] Admin dev-server is not running on port 8081. Spawning it automatically...");
    const serverScript = path.join(root, "scripts", "dev-server.mjs");
    try {
      const child = spawn("node", [serverScript], {
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      console.log("[Klay Studio] Admin dev-server spawned successfully!");
    } catch (err) {
      console.error("[Klay Studio] Failed to spawn admin dev-server:", err);
    }
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath ? `${pagesBasePath}/` : "",
  images: {
    unoptimized: true
  },
  turbopack: {
    root
  }
};

export default nextConfig;
