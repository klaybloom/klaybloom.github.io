import type { ExperienceItem } from "@/content/types";
import { Section } from "./Section";

type ExperienceProps = {
  items: ExperienceItem[];
};

export function Experience({ items }: ExperienceProps) {
  return (
    <Section id="experience" number="04" title="工作经历">
      <div className="relative border-l-2 border-notion-accent pl-8">
        {items.flatMap((item) =>
          item.description.map((description) => (
            <div
              key={description}
              className="group relative pb-8 text-[15px] leading-[1.75] text-notion-muted last:pb-0"
            >
              <span className="absolute -left-[calc(2rem+5px)] top-[1.1rem] h-2.5 w-2.5 rounded-full border-2 border-notion-accent bg-notion-bg transition-all group-hover:bg-notion-accent group-hover:shadow-[0_0_0_4px_rgba(45,90,61,0.15)]" />
              {description}
            </div>
          ))
        )}
      </div>
    </Section>
  );
}
