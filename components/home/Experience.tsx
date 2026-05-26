import type { ExperienceItem } from "@/content/types";
import { Section } from "./Section";

type ExperienceProps = {
  items: ExperienceItem[];
  title: string;
  number: string;
};

export function Experience({ items, title, number }: ExperienceProps) {
  return (
    <Section id="experience" number={number} title={title}>
      <div className="tahoe-experience-grid">
        {items.map((item) => (
          <article className="tahoe-experience-card" key={`${item.company}-${item.title}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-[20px] font-semibold leading-snug text-[color:var(--tahoe-text)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[13px] font-medium text-[color:var(--tahoe-faint)]">
                  {item.company}
                </p>
              </div>
              <span className="tahoe-status">{item.period}</span>
            </div>
            <ul className="mt-6 grid gap-3 text-[14px] leading-7 text-[color:var(--tahoe-muted)]">
              {item.description.map((desc) => (
                <li className="tahoe-experience-point" key={desc}>
                  {desc}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
