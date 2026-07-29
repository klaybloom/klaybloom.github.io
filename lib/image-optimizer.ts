import fs from "node:fs";
import path from "node:path";
import { convertImageToWebp, IMAGE_MAX_BYTES } from "./image-processing";

const LEGACY_IMAGE_PATTERN = /\.(?:png|jpe?g)$/i;

export type ImageOptimizationEntry = {
  sourcePath: string;
  targetPath: string;
  sourceUrl: string;
  targetUrl: string;
};

export type ImageOptimizationPlan = {
  rootDir: string;
  entries: ImageOptimizationEntry[];
};

export function planPostImageOptimization(
  rootDir: string,
): ImageOptimizationPlan {
  const publicDir = path.join(rootDir, "public");
  const imageDir = path.join(publicDir, "images", "posts");
  const sourcePaths = fs.existsSync(imageDir)
    ? walkFiles(imageDir).filter((filePath) =>
        LEGACY_IMAGE_PATTERN.test(filePath),
      )
    : [];
  const claimedTargets = new Map<string, string>();
  const entries = sourcePaths.map((sourcePath) => {
    const targetPath = sourcePath.replace(LEGACY_IMAGE_PATTERN, ".webp");
    const targetKey = targetPath.toLowerCase();
    const previousSource = claimedTargets.get(targetKey);
    if (previousSource || fs.existsSync(targetPath)) {
      throw new Error(
        `WebP target conflict: ${sourcePath} -> ${targetPath}${
          previousSource ? ` (also used by ${previousSource})` : ""
        }`,
      );
    }
    claimedTargets.set(targetKey, sourcePath);
    return {
      sourcePath,
      targetPath,
      sourceUrl: toPublicUrl(publicDir, sourcePath),
      targetUrl: toPublicUrl(publicDir, targetPath),
    };
  });

  return { rootDir, entries };
}

export async function preparePostImageOptimization(
  plan: ImageOptimizationPlan,
) {
  if (plan.entries.length === 0) {
    return { converted: 0, updatedPosts: 0 };
  }

  const temporaryOutputs: Array<{ temporaryPath: string; targetPath: string }> =
    [];
  try {
    for (const entry of plan.entries) {
      const input = await fs.promises.readFile(entry.sourcePath);
      const output = await convertImageToWebp(input, {
        maxBytes: IMAGE_MAX_BYTES,
      });
      const temporaryPath = `${entry.targetPath}.tmp-${process.pid}-${Date.now()}`;
      await fs.promises.writeFile(temporaryPath, output);
      temporaryOutputs.push({ temporaryPath, targetPath: entry.targetPath });
    }

    for (const output of temporaryOutputs) {
      await fs.promises.rename(output.temporaryPath, output.targetPath);
    }
  } finally {
    await Promise.all(
      temporaryOutputs.map(({ temporaryPath }) =>
        fs.promises.rm(temporaryPath, { force: true }),
      ),
    );
  }

  const postsDir = path.join(plan.rootDir, "content", "posts");
  let updatedPosts = 0;
  for (const postPath of fs.existsSync(postsDir)
    ? walkFiles(postsDir).filter((filePath) => filePath.endsWith(".md"))
    : []) {
    const before = await fs.promises.readFile(postPath, "utf8");
    let after = before;
    for (const entry of plan.entries) {
      after = after.split(entry.sourceUrl).join(entry.targetUrl);
    }
    if (after !== before) {
      await atomicWrite(postPath, after);
      updatedPosts += 1;
    }
  }

  return { converted: plan.entries.length, updatedPosts };
}

export async function finalizePostImageOptimization(
  plan: ImageOptimizationPlan,
) {
  const postsDir = path.join(plan.rootDir, "content", "posts");
  const postContents = fs.existsSync(postsDir)
    ? await Promise.all(
        walkFiles(postsDir)
          .filter((filePath) => filePath.endsWith(".md"))
          .map((filePath) => fs.promises.readFile(filePath, "utf8")),
      )
    : [];

  for (const entry of plan.entries) {
    if (!fs.existsSync(entry.targetPath)) {
      throw new Error(`Missing converted image: ${entry.targetPath}`);
    }
    if (postContents.some((content) => content.includes(entry.sourceUrl))) {
      throw new Error(`Legacy image is still referenced: ${entry.sourceUrl}`);
    }
  }

  await Promise.all(
    plan.entries.map((entry) => fs.promises.unlink(entry.sourcePath)),
  );
  return { deleted: plan.entries.length };
}

export async function optimizePostImages(rootDir: string) {
  const plan = planPostImageOptimization(rootDir);
  const prepared = await preparePostImageOptimization(plan);
  const finalized = await finalizePostImageOptimization(plan);
  return { ...prepared, ...finalized };
}

function walkFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function toPublicUrl(publicDir: string, filePath: string) {
  return `/${path.relative(publicDir, filePath).split(path.sep).join("/")}`;
}

async function atomicWrite(filePath: string, content: string) {
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  try {
    await fs.promises.writeFile(temporaryPath, content);
    await fs.promises.rename(temporaryPath, filePath);
  } finally {
    await fs.promises.rm(temporaryPath, { force: true });
  }
}
