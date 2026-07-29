import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { optimizePostImages } from "../lib/image-optimizer";

let rootDir: string;

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "klay-images-"));
  fs.mkdirSync(path.join(rootDir, "public", "images", "posts"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(rootDir, "content", "posts"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe("post image optimizer", () => {
  it("converts legacy images, updates front matter and Markdown, then becomes idempotent", async () => {
    const sourcePath = path.join(
      rootDir,
      "public",
      "images",
      "posts",
      "sample.png",
    );
    await sharp({
      create: {
        width: 2000,
        height: 1000,
        channels: 3,
        background: "#123456",
      },
    })
      .png()
      .toFile(sourcePath);
    const postPath = path.join(rootDir, "content", "posts", "sample.md");
    fs.writeFileSync(
      postPath,
      [
        "---",
        'cover: "/images/posts/sample.png"',
        "---",
        "![sample](/images/posts/sample.png)",
      ].join("\n"),
    );

    const first = await optimizePostImages(rootDir);
    const outputPath = sourcePath.replace(/\.png$/, ".webp");
    const metadata = await sharp(outputPath).metadata();
    const updatedPost = fs.readFileSync(postPath, "utf8");

    expect(first).toEqual({ converted: 1, updatedPosts: 1, deleted: 1 });
    expect(fs.existsSync(sourcePath)).toBe(false);
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(1600);
    expect(metadata.height).toBe(800);
    expect(updatedPost).not.toContain(".png");
    expect(updatedPost.match(/\/images\/posts\/sample\.webp/g)).toHaveLength(2);

    const beforeSecondRun = fs.readFileSync(outputPath);
    expect(await optimizePostImages(rootDir)).toEqual({
      converted: 0,
      updatedPosts: 0,
      deleted: 0,
    });
    expect(fs.readFileSync(outputPath)).toEqual(beforeSecondRun);
  });

  it("rejects target conflicts before changing any file", async () => {
    const imageDir = path.join(rootDir, "public", "images", "posts");
    const sourcePath = path.join(imageDir, "same.jpg");
    const targetPath = path.join(imageDir, "same.webp");
    await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 3,
        background: "#ffffff",
      },
    })
      .jpeg()
      .toFile(sourcePath);
    fs.writeFileSync(targetPath, "existing target");

    await expect(optimizePostImages(rootDir)).rejects.toThrow(/conflict/i);
    expect(fs.existsSync(sourcePath)).toBe(true);
    expect(fs.readFileSync(targetPath, "utf8")).toBe("existing target");
  });

  it("rejects multiple legacy files that map to the same WebP path", async () => {
    const imageDir = path.join(rootDir, "public", "images", "posts");
    for (const extension of ["png", "jpg"]) {
      await sharp({
        create: {
          width: 20,
          height: 20,
          channels: 3,
          background: "#ffffff",
        },
      })
        .toFormat(extension === "png" ? "png" : "jpeg")
        .toFile(path.join(imageDir, `duplicate.${extension}`));
    }

    await expect(optimizePostImages(rootDir)).rejects.toThrow(/conflict/i);
    expect(fs.readdirSync(imageDir).sort()).toEqual([
      "duplicate.jpg",
      "duplicate.png",
    ]);
  });
});
