import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkAssets } from "../lib/asset-checks";
import { validateContent } from "../lib/content-checks";

let rootDir: string;

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "klay-checks-"));
  fs.mkdirSync(path.join(rootDir, "content", "posts"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "public", "images", "posts"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(rootDir, "out", "blog"), { recursive: true });

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
  fs.writeFileSync(
    path.join(rootDir, "public", "images", "posts", "cover.webp"),
    "image",
  );
  fs.writeFileSync(
    path.join(rootDir, "content", "posts", "valid-post.md"),
    [
      "---",
      'title: "Valid post"',
      'date: "2026-07-29"',
      'description: "Description"',
      'tags: ["Testing"]',
      'category: "Engineering"',
      'cover: "/images/posts/cover.webp"',
      "published: true",
      "featured: false",
      "---",
      "![cover](/images/posts/cover.webp)",
      "",
      "[site](/projects/) [external](https://example.com)",
    ].join("\n"),
  );
});

afterEach(() => {
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe("content checks", () => {
  it("accepts valid schemas, front matter, links and image references", () => {
    expect(validateContent(rootDir)).toEqual([]);
  });

  it("reports invalid dates, slugs, empty links and missing images", () => {
    fs.renameSync(
      path.join(rootDir, "content", "posts", "valid-post.md"),
      path.join(rootDir, "content", "posts", "Bad Slug.md"),
    );
    fs.writeFileSync(
      path.join(rootDir, "content", "posts", "Bad Slug.md"),
      [
        "---",
        'title: "Invalid post"',
        'date: "2026-02-31"',
        'description: "Description"',
        'tags: ["Testing"]',
        "published: true",
        "featured: false",
        "---",
        "![missing](/images/posts/missing.webp)",
        "",
        "[empty]()",
      ].join("\n"),
    );

    const codes = validateContent(rootDir).map((issue) => issue.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        "INVALID_POST_SLUG",
        "INVALID_FRONTMATTER",
        "MISSING_IMAGE",
        "EMPTY_LINK",
      ]),
    );
  });
});

describe("asset checks", () => {
  it("reports individual, aggregate and export size violations", () => {
    fs.writeFileSync(
      path.join(rootDir, "public", "images", "posts", "large.webp"),
      Buffer.alloc(12),
    );
    fs.writeFileSync(path.join(rootDir, "out", "blog", "index.html"), "123456");
    fs.writeFileSync(path.join(rootDir, "out", "large.bin"), Buffer.alloc(20));

    const result = checkAssets(rootDir, {
      maxImageBytes: 10,
      maxBlogImagesBytes: 15,
      maxOutBytes: 20,
      maxBlogIndexBytes: 5,
    });

    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "IMAGE_TOO_LARGE",
        "BLOG_IMAGES_TOO_LARGE",
        "EXPORT_TOO_LARGE",
        "BLOG_INDEX_TOO_LARGE",
      ]),
    );
  });
});
