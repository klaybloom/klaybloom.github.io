import fs from "node:fs";
import path from "node:path";
import {
  finalizePostImageOptimization,
  optimizePostImages,
  planPostImageOptimization,
  preparePostImageOptimization,
  type ImageOptimizationPlan,
} from "../lib/image-optimizer";

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, ".klay-image-optimization-plan.json");
const mode = process.argv[2];

async function main() {
  if (mode === "--prepare") {
    const plan = planPostImageOptimization(rootDir);
    const result = await preparePostImageOptimization(plan);
    await fs.promises.writeFile(
      manifestPath,
      `${JSON.stringify(plan, null, 2)}\n`,
    );
    console.log(
      `[Klay Studio] Prepared ${result.converted} WebP files and updated ${result.updatedPosts} posts`,
    );
  } else if (mode === "--finalize") {
    const plan = JSON.parse(
      await fs.promises.readFile(manifestPath, "utf8"),
    ) as ImageOptimizationPlan;
    if (path.resolve(plan.rootDir) !== path.resolve(rootDir)) {
      throw new Error("Image optimization manifest belongs to another workspace");
    }
    const result = await finalizePostImageOptimization(plan);
    await fs.promises.rm(manifestPath, { force: true });
    console.log(`[Klay Studio] Deleted ${result.deleted} legacy image files`);
  } else {
    const result = await optimizePostImages(rootDir);
    console.log(
      `[Klay Studio] Converted ${result.converted}, updated ${result.updatedPosts}, deleted ${result.deleted}`,
    );
  }
}

void main();
