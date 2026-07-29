// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import ProjectPage from "../app/projects/[slug]/page";
import { Hero } from "../components/home/Hero";
import { Projects } from "../components/home/Projects";
import { ProjectCard } from "../components/projects/ProjectCard";
import { highlights } from "../content/highlights";
import { profile } from "../content/profile";
import { projects } from "../content/projects";

beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

describe("portfolio visitor path", () => {
  it("offers direct project, GitHub and email actions in the hero", () => {
    render(<Hero profile={profile} highlights={highlights} />);

    expect(screen.getByRole("link", { name: "查看项目" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/klaybloom",
    );
    expect(screen.getByRole("link", { name: "联系我" })).toHaveAttribute(
      "href",
      "mailto:klaybloom@gmail.com",
    );
  });

  it("renders case study sections for a public project", async () => {
    render(
      await ProjectPage({
        params: Promise.resolve({ slug: "documind-rag" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "我的职责" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "关键实现" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "交付结果" })).toBeInTheDocument();
    expect(screen.queryByText(/项目内容涉及企业内部信息/)).not.toBeInTheDocument();
  });

  it("uses a public project cover on homepage and project list cards", () => {
    const project = projects.find((item) => item.slug === "documind-rag");
    expect(project).toBeTruthy();

    render(
      <div>
        <Projects projects={[project!]} number="01" title="精选项目" />
        <ProjectCard project={project!} index={0} />
      </div>,
    );

    expect(
      screen.getAllByRole("img", { name: "RAG 企业知识库问答系统" }),
    ).toHaveLength(2);
  });

  it("explains why a limited project has no public source links", async () => {
    render(
      await ProjectPage({
        params: Promise.resolve({ slug: "bank-audit-platform" }),
      }),
    );

    expect(
      screen.getByText(/项目内容涉及企业内部信息，仅展示经过脱敏的职责与技术实践/),
    ).toBeInTheDocument();
    const projectArticle = within(screen.getByRole("article"));
    expect(projectArticle.queryByRole("link", { name: "GitHub" })).not.toBeInTheDocument();
    expect(projectArticle.queryByRole("link", { name: "在线预览" })).not.toBeInTheDocument();
  });
});
