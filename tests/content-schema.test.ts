import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  experienceFileSchema,
  homeSectionsFileSchema,
  postSaveSchema,
  profileSchema,
  projectDisclosureSchema,
  projectsFileSchema,
  projectStatusSchema,
  skillsFileSchema,
} from "../lib/content-schema";

function readJson(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "content", fileName), "utf8"),
  );
}

describe("content schemas", () => {
  test("accepts every current content file", () => {
    expect(profileSchema.parse(readJson("profile.json"))).toBeTruthy();
    expect(experienceFileSchema.parse(readJson("experience.json"))).toBeTruthy();
    expect(projectsFileSchema.parse(readJson("projects.json"))).toBeTruthy();
    expect(skillsFileSchema.parse(readJson("skills.json"))).toBeTruthy();
    expect(homeSectionsFileSchema.parse(readJson("home-sections.json"))).toBeTruthy();
  });

  test.each(["planning", "building", "launched", "paused", "archived"])(
    "accepts the project status %s",
    (status) => {
      expect(projectStatusSchema.parse(status)).toBe(status);
    },
  );

  test.each(["public", "limited"])(
    "accepts the project disclosure level %s",
    (disclosure) => {
      expect(projectDisclosureSchema.parse(disclosure)).toBe(disclosure);
    },
  );

  test("accepts a project case study and rejects an incomplete one", () => {
    const current = readJson("projects.json").projects[0];
    const project = {
      ...current,
      disclosure: "public",
      caseStudy: {
        role: "Java / AI 应用开发",
        responsibilities: ["负责知识库问答链路开发"],
        highlights: ["实现混合检索与重排序"],
        outcomes: ["形成可公开验证的项目实现"],
      },
    };

    expect(projectsFileSchema.parse({ projects: [project] })).toBeTruthy();
    expect(() =>
      projectsFileSchema.parse({
        projects: [
          {
            ...project,
            caseStudy: {
              ...project.caseStudy,
              role: "",
            },
          },
        ],
      }),
    ).toThrow(/role/i);
    expect(() =>
      projectsFileSchema.parse({
        projects: [
          {
            ...project,
            caseStudy: {
              ...project.caseStudy,
              responsibilities: [],
            },
          },
        ],
      }),
    ).toThrow(/responsibilities/i);
  });

  test("rejects duplicate project slugs", () => {
    const current = readJson("projects.json");
    current.projects.push({ ...current.projects[0] });

    expect(() => projectsFileSchema.parse(current)).toThrow(/slug/i);
  });

  test("rejects invalid project dates", () => {
    const current = readJson("projects.json");
    current.projects[0].date = "July 2026";

    expect(() => projectsFileSchema.parse(current)).toThrow();
  });

  test("rejects unexpected profile fields", () => {
    expect(() =>
      profileSchema.parse({
        ...readJson("profile.json"),
        privatePhone: "secret",
      }),
    ).toThrow();
  });

  test("accepts a valid post save payload and rejects an unsafe slug", () => {
    const post = {
      slug: "safe-post",
      data: {
        frontmatter: {
          title: "Safe post",
          date: "2026-07-29",
          description: "Description",
          tags: ["Security"],
          published: true,
          featured: false,
        },
        content: "# Hello",
      },
    };

    expect(postSaveSchema.parse(post).slug).toBe("safe-post");
    expect(() =>
      postSaveSchema.parse({ ...post, slug: "../unsafe" }),
    ).toThrow();
  });
});
