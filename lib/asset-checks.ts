import fs from "node:fs";
import path from "node:path";
import type { CheckIssue } from "./content-checks";

export type AssetLimits = {
  maxImageBytes: number;
  maxBlogImagesBytes: number;
  maxOutBytes: number;
  maxBlogIndexBytes: number;
};

const DEFAULT_LIMITS: AssetLimits = {
  maxImageBytes: 1024 * 1024,
  maxBlogImagesBytes: 80 * 1024 * 1024,
  maxOutBytes: 120 * 1024 * 1024,
  maxBlogIndexBytes: 200 * 1024,
};

export function checkAssets(
  rootDir: string,
  limits: AssetLimits = DEFAULT_LIMITS,
) {
  const issues: CheckIssue[] = [];
  const publicImagesDir = path.join(rootDir, "public", "images");
  const blogImagesDir = path.join(publicImagesDir, "posts");
  const outDir = path.join(rootDir, "out");
  const blogIndexPath = path.join(outDir, "blog", "index.html");

  for (const imagePath of fs.existsSync(publicImagesDir)
    ? walkFiles(publicImagesDir)
    : []) {
    const bytes = fs.statSync(imagePath).size;
    if (bytes > limits.maxImageBytes) {
      issues.push({
        code: "IMAGE_TOO_LARGE",
        file: relative(rootDir, imagePath),
        message: `${bytes} bytes exceeds ${limits.maxImageBytes}`,
      });
    }
  }

  const blogImagesBytes = directorySize(blogImagesDir);
  const outBytes = directorySize(outDir);
  const blogIndexBytes = fs.existsSync(blogIndexPath)
    ? fs.statSync(blogIndexPath).size
    : 0;

  if (blogImagesBytes > limits.maxBlogImagesBytes) {
    issues.push({
      code: "BLOG_IMAGES_TOO_LARGE",
      file: relative(rootDir, blogImagesDir),
      message: `${blogImagesBytes} bytes exceeds ${limits.maxBlogImagesBytes}`,
    });
  }
  if (outBytes > limits.maxOutBytes) {
    issues.push({
      code: "EXPORT_TOO_LARGE",
      file: relative(rootDir, outDir),
      message: `${outBytes} bytes exceeds ${limits.maxOutBytes}`,
    });
  }
  if (blogIndexBytes > limits.maxBlogIndexBytes) {
    issues.push({
      code: "BLOG_INDEX_TOO_LARGE",
      file: relative(rootDir, blogIndexPath),
      message: `${blogIndexBytes} bytes exceeds ${limits.maxBlogIndexBytes}`,
    });
  }

  return {
    issues,
    metrics: {
      blogImagesBytes,
      outBytes,
      blogIndexBytes,
    },
  };
}

function directorySize(directory: string): number {
  if (!fs.existsSync(directory)) return 0;
  return walkFiles(directory).reduce(
    (total, filePath) => total + fs.statSync(filePath).size,
    0,
  );
}

function walkFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function relative(rootDir: string, filePath: string) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}
