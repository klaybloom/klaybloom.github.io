import type { ExperienceItem } from "@/content/types";
import { Section } from "./Section";

type ExperienceProps = {
  items: ExperienceItem[];
};

export function Experience({ items }: ExperienceProps) {
  return (
    <Section id="experience" title="工作经历">
      <ul className="space-y-4 text-[15px] leading-relaxedBody text-notion-muted">
        {items.flatMap((item) =>
          item.description.map((description) => (
            <li key={description} className="border-l-4 border-notion-line pl-5">
              {description}
            </li>
          ))
        )}
      </ul>
    </Section>
  );
}
