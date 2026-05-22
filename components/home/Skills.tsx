import type { SkillGroup } from "@/content/types";
import { Section } from "./Section";

type SkillsProps = {
  skills: SkillGroup[];
};

export function Skills({ skills }: SkillsProps) {
  return (
    <Section id="skills" number="01" title="技术能力">
      <div className="grid gap-px overflow-hidden rounded-xl border border-notion-line bg-notion-line sm:grid-cols-2">
        {skills.map((skill, index) => (
          <div
            key={skill.group}
            className={`bg-notion-paper p-6 transition-colors hover:bg-notion-hover animate-on-scroll stagger-${(index % 4) + 1}`}
          >
            <div className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-notion-accent">
              {skill.group}
            </div>
            <div className="text-[14px] leading-relaxed text-notion-muted">
              {skill.items.join(", ")}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
