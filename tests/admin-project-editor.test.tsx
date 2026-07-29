// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import experienceData from "../content/experience.json";
import homeSectionsData from "../content/home-sections.json";
import profileData from "../content/profile.json";
import projectsData from "../content/projects.json";
import skillsData from "../content/skills.json";

const adminClientMocks = vi.hoisted(() => ({
  loadData: vi.fn(),
  listPosts: vi.fn(),
  save: vi.fn(),
  upload: vi.fn(),
}));

vi.mock("@/lib/admin/client", () => ({
  adminClient: adminClientMocks,
}));

import { AdminDashboard } from "../components/admin/AdminDashboard";

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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("admin project editor", () => {
  it("edits and saves disclosure and case study fields", async () => {
    adminClientMocks.loadData.mockResolvedValue({
      profile: profileData,
      experience: experienceData.experience,
      projects: projectsData.projects,
      skills: skillsData.skills,
      homeSections: homeSectionsData.sections,
    });
    adminClientMocks.listPosts.mockResolvedValue([]);
    adminClientMocks.save.mockResolvedValue(undefined);

    render(<AdminDashboard />);

    await waitFor(() => expect(adminClientMocks.loadData).toHaveBeenCalled());
    fireEvent.click(screen.getByText("技术项目").closest("button") as HTMLButtonElement);

    const title = await screen.findByText("RAG 企业知识库问答系统");
    const projectCard = title.closest(".tahoe-system-card");
    expect(projectCard).not.toBeNull();
    fireEvent.click(
      within(projectCard as HTMLElement).getByText("编辑"),
    );

    expect(screen.getByLabelText("信息公开级别")).toHaveValue("public");
    expect(screen.getByLabelText("我的角色")).toHaveValue(
      "Java 后端与 AI 应用开发",
    );
    expect(
      (screen.getByLabelText("职责清单") as HTMLTextAreaElement).value,
    ).toContain("知识库问答核心链路");
    expect(
      (screen.getByLabelText("关键实现清单") as HTMLTextAreaElement).value,
    ).toContain("混合召回");
    expect(
      (screen.getByLabelText("交付结果清单") as HTMLTextAreaElement).value,
    ).toContain("Java RAG 项目");

    fireEvent.change(screen.getByLabelText("我的角色"), {
      target: { value: "更新后的项目角色" },
    });
    fireEvent.click(screen.getByText(/保存此项目/));

    await waitFor(() =>
      expect(adminClientMocks.save).toHaveBeenCalledWith(
        "projects",
        expect.objectContaining({
          projects: expect.arrayContaining([
            expect.objectContaining({
              slug: "documind-rag",
              disclosure: "public",
              caseStudy: expect.objectContaining({
                role: "更新后的项目角色",
              }),
            }),
          ]),
        }),
        undefined,
      ),
    );
  });
});
