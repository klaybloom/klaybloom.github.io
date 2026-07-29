import { checkAssets } from "../lib/asset-checks";

const result = checkAssets(process.cwd());
for (const [name, bytes] of Object.entries(result.metrics)) {
  console.log(`[Klay Studio] ${name}: ${formatBytes(bytes)}`);
}

if (result.issues.length > 0) {
  for (const issue of result.issues) {
    console.error(`[${issue.code}] ${issue.file}: ${issue.message}`);
  }
  process.exitCode = 1;
} else {
  console.log("[Klay Studio] Asset budgets passed");
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}
