import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { projects } from "../content/projects";
import type { Project } from "../content/types";
import { getLatestPosts } from "../lib/posts";
import { getLatestProjects } from "../lib/projects";

const originalProjects = [...projects];
const temporaryPostFiles: string[] = [];

afterEach(() => {
  projects.splice(0, projects.length, ...originalProjects);
  temporaryPostFiles.splice(0).forEach((filePath) => {
    fs.rmSync(filePath, { force: true });
  });
});

function projectFixture(
  slug: string,
  pinned: boolean,
  updated: string,
): Project {
  return {
    ...originalProjects[0],
    title: slug,
    slug,
    date: "2024-01-01",
    updated,
    featured: true,
    pinned,
  };
}

function writePost(
  slug: string,
  date: string,
  featured: boolean,
) {
  const filePath = path.join(process.cwd(), "content", "posts", `${slug}.md`);
  fs.writeFileSync(
    filePath,
    [
      "---",
      `title: ${slug}`,
      `date: ${date}`,
      "description: Selection test",
      "tags:",
      "  - Selection",
      "published: true",
      `featured: ${featured}`,
      "---",
      "",
      "# Test",
    ].join("\n"),
  );
  temporaryPostFiles.push(filePath);
}

describe("homepage content selection", () => {
  it("orders featured projects by pinned state and updated date", () => {
    projects.splice(
      0,
      projects.length,
      projectFixture("pinned-older", true, "2026-06-01"),
      projectFixture("unpinned-newest", false, "2026-08-01"),
      projectFixture("pinned-newest", true, "2026-07-01"),
    );

    expect(getLatestProjects(3).map((project) => project.slug)).toEqual([
      "pinned-newest",
      "pinned-older",
      "unpinned-newest",
    ]);
  });

  it("shows featured posts first and fills remaining slots with the latest posts", () => {
    writePost("selection-featured", "2098-01-01", true);
    writePost("selection-latest", "2099-01-03", false);
    writePost("selection-second-latest", "2099-01-02", false);

    expect(getLatestPosts(2).map((post) => post.slug)).toEqual([
      "selection-featured",
      "selection-latest",
    ]);
  });
});
