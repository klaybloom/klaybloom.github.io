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
      <div className="tahoe-system-card mb-10 !p-3">
        <div className="tahoe-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            aria-label="搜索项目"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索项目标题、描述、技术栈..."
            type="search"
            value={query}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["全部", ...stacks].map((stack) => {
            const isActive = selectedStack === stack;

            return (
              <button
                className={isActive ? "tahoe-segment is-active" : "tahoe-segment"}
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
