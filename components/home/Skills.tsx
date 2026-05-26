import type { SkillGroup } from "@/content/types";
import { Section } from "./Section";

type SkillsProps = {
  skills: SkillGroup[];
  title: string;
  number: string;
};

export function Skills({ skills, title, number }: SkillsProps) {
  return (
    <Section id="skills" number={number} title={title}>
      <div className="tahoe-skill-grid">
        {skills.map((skill) => (
          <article className="tahoe-skill-card" key={skill.group}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px] font-semibold text-[color:var(--tahoe-text)]">
                {skill.group}
              </h3>
              <span className="tahoe-status">{skill.items.length}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <span className="tahoe-small-tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
