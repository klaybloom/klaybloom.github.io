import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
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
