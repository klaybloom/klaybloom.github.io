import type { ExperienceItem } from "@/content/types";
import { Section } from "./Section";

type ExperienceProps = {
  items: ExperienceItem[];
};

export function Experience({ items }: ExperienceProps) {
  return (
    <Section id="experience" number="04" title="工作经历">
      <div className="relative border-l border-notion-line pl-6 ml-3 space-y-12">
        {items.map((item) => (
          <div
            key={`${item.company}-${item.title}`}
            className="animate-on-scroll stagger-3 group relative"
          >
            {/* Timeline Dot */}
            <span className="absolute -left-[calc(1.5rem+4.5px)] top-1.5 h-2 w-2 rounded-full border border-notion-accent bg-notion-bg transition-all group-hover:bg-notion-accent group-hover:scale-125 group-hover:shadow-[0_0_0_4px_rgba(45,90,61,0.15)]" />

            {/* Layout Grid */}
            <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
              {/* Period */}
              <div className="font-mono text-[13px] font-medium text-notion-accent">
                {item.period}
              </div>

              {/* Details */}
              <div>
                <h3 className="font-serif text-[1.1rem] font-semibold text-notion-text">
                  {item.title}
                </h3>
                <div className="mt-1 font-mono text-[12px] text-notion-faint">
                  {item.company}
                </div>

                {/* Description Bullets */}
                <ul className="mt-3 list-disc pl-4 space-y-1.5 text-[14px] leading-relaxed text-notion-muted">
                  {item.description.map((desc) => (
                    <li key={desc} className="pl-1">
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
