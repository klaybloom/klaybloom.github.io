import { validateContent } from "../lib/content-checks";

const issues = validateContent(process.cwd());
if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`[${issue.code}] ${issue.file}: ${issue.message}`);
  }
  process.exitCode = 1;
} else {
  console.log("[Klay Studio] Content validation passed");
}
