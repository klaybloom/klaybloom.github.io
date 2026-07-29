import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ZodType } from "zod";
import {
  experienceFileSchema,
  homeSectionsFileSchema,
  postFrontmatterSchema,
  profileSchema,
  projectsFileSchema,
  skillsFileSchema,
} from "./content-schema";

export type CheckIssue = {
  code: string;
  file: string;
  message: string;
};

const jsonChecks: Array<{ fileName: string; schema: ZodType }> = [
  { fileName: "profile.json", schema: profileSchema },
  { fileName: "experience.json", schema: experienceFileSchema },
  { fileName: "projects.json", schema: projectsFileSchema },
  { fileName: "skills.json", schema: skillsFileSchema },
  { fileName: "home-sections.json", schema: homeSectionsFileSchema },
];

export function validateContent(rootDir: string): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const contentDir = path.join(rootDir, "content");

  for (const check of jsonChecks) {
    const filePath = path.join(contentDir, check.fileName);
    try {
      check.schema.parse(JSON.parse(fs.readFileSync(filePath, "utf8")));
    } catch (error) {
      issues.push({
        code: "INVALID_JSON_CONTENT",
        file: relative(rootDir, filePath),
        message: getErrorMessage(error),
      });
    }
  }

  const postsDir = path.join(contentDir, "posts");
  const slugs = new Set<string>();
  for (const filePath of fs.existsSync(postsDir)
    ? walkFiles(postsDir).filter((entry) => entry.endsWith(".md"))
    : []) {
    const file = relative(rootDir, filePath);
    const slug = path.basename(filePath, ".md");
    if (!/^[a-z0-9][a-z0-9-_]*$/.test(slug)) {
      issues.push({
        code: "INVALID_POST_SLUG",
        file,
        message: `Invalid post slug: ${slug}`,
      });
    }
    if (slugs.has(slug.toLowerCase())) {
      issues.push({
        code: "DUPLICATE_POST_SLUG",
        file,
        message: `Duplicate post slug: ${slug}`,
      });
    }
    slugs.add(slug.toLowerCase());

    let raw = "";
    try {
      raw = fs.readFileSync(filePath, "utf8");
      const parsed = matter(raw);
      postFrontmatterSchema.parse({
        ...parsed.data,
        date: String(parsed.data.date ?? ""),
        updated: parsed.data.updated
          ? String(parsed.data.updated)
          : undefined,
      });
      if (!parsed.content.trim()) {
        issues.push({
          code: "EMPTY_POST_CONTENT",
          file,
          message: "Post body is empty",
        });
      }
    } catch (error) {
      issues.push({
        code: "INVALID_FRONTMATTER",
        file,
        message: getErrorMessage(error),
      });
    }

    checkMarkdownLinks(rootDir, file, raw, issues);
  }

  return issues;
}

function checkMarkdownLinks(
  rootDir: string,
  file: string,
  markdown: string,
  issues: CheckIssue[],
) {
  const linkPattern = /!?\[[^\]]*]\(([^)]*)\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const rawTarget = match[1].trim();
    const target = rawTarget.replace(/\s+["'][^"']*["']$/, "").trim();
    if (!target) {
      issues.push({
        code: "EMPTY_LINK",
        file,
        message: "Markdown link target is empty",
      });
      continue;
    }
    if (
      !target.startsWith("/") &&
      !target.startsWith("#") &&
      !/^(https?:|mailto:)/i.test(target)
    ) {
      issues.push({
        code: "UNSAFE_LINK",
        file,
        message: `Unsupported link target: ${target}`,
      });
    }
  }

  const imagePattern = /!\[[^\]]*]\(([^)]*)\)/g;
  for (const match of markdown.matchAll(imagePattern)) {
    const rawTarget = match[1].trim();
    const target = rawTarget.replace(/\s+["'][^"']*["']$/, "").trim();
    if (!target.startsWith("/")) continue;
    const cleanTarget = target.split(/[?#]/, 1)[0];
    const publicDir = path.join(rootDir, "public");
    const imagePath = path.resolve(publicDir, `.${cleanTarget}`);
    if (
      !imagePath.startsWith(`${publicDir}${path.sep}`) ||
      !fs.existsSync(imagePath)
    ) {
      issues.push({
        code: "MISSING_IMAGE",
        file,
        message: `Referenced image does not exist: ${target}`,
      });
    }
  }
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
