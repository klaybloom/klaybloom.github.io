"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/content/types";
import { getProjectSearchText } from "@/lib/projects";
import { ProjectGrid } from "./ProjectGrid";

type ProjectFilterProps = {
  projects: Project[];
  stacks: string[];
};

export function ProjectFilter({ projects, stacks }: ProjectFilterProps) {
  const [query, setQuery] = useState("");
  const [selectedStack, setSelectedStack] = useState("全部");

  const filteredProjects = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesStack =
        selectedStack === "全部" || project.stack.includes(selectedStack);
      const matchesQuery =
        !keyword || getProjectSearchText(project).includes(keyword);

      return matchesStack && matchesQuery;
    });
  }, [projects, query, selectedStack]);

  return (
    <div>
      <div className="mb-8 rounded-[22px] border border-notion-line bg-white/72 p-3">
        <input
          aria-label="搜索项目"
          className="h-11 w-full rounded-[16px] border border-notion-line bg-white px-4 text-[14px] text-notion-text outline-none transition placeholder:text-notion-faint focus:border-notion-accent"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索项目标题、描述、技术栈..."
          type="search"
          value={query}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {["全部", ...stacks].map((stack) => {
            const isActive = selectedStack === stack;

            return (
              <button
                className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
                  isActive
                    ? "border-notion-accent bg-notion-accent text-white"
                    : "border-notion-line bg-white text-notion-muted hover:bg-notion-hover hover:text-notion-text"
                }`}
                key={stack}
                onClick={() => setSelectedStack(stack)}
                type="button"
              >
                {stack}
              </button>
            );
          })}
        </div>
      </div>
      <ProjectGrid projects={filteredProjects} />
    </div>
  );
}
