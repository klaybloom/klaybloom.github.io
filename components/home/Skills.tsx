import type { SkillGroup } from "@/content/types";
import { Section } from "./Section";

type SkillsProps = {
  skills: SkillGroup[];
};

export function Skills({ skills }: SkillsProps) {
  return (
    <Section id="skills" title="技术能力">
      <div className="divide-y divide-notion-line border-y border-notion-line">
        {skills.map((skill) => (
          <div
            key={skill.group}
            className="grid gap-2 py-4 text-[15px] leading-relaxed sm:grid-cols-[150px_1fr]"
          >
            <div className="font-semibold text-notion-accent">
              {skill.group}
            </div>
            <div className="text-notion-muted">{skill.items.join(", ")}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
