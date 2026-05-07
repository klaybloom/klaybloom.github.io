import type { Highlight } from "@/content/types";
import { Section } from "./Section";

type HighlightsProps = {
  items: Highlight[];
};

export function Highlights({ items }: HighlightsProps) {
  return (
    <Section id="status" title="当前状态">
      <div className="border-l-4 border-notion-accent bg-notion-hover/65 py-1 pl-5 text-[15px] leading-relaxedBody text-notion-muted">
        {items.map((item, index) => (
          <p className={index === 0 ? undefined : "mt-3"} key={item.label}>
            {item.value}
          </p>
        ))}
      </div>
    </Section>
  );
}
