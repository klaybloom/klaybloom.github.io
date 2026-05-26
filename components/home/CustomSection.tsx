import { Section } from "./Section";

type CustomSectionProps = {
  sectionId: string;
  title: string;
  bodyHtml: string;
  number: string;
};

export function CustomSection({
  sectionId,
  title,
  bodyHtml,
  number,
}: CustomSectionProps) {
  return (
    <Section id={sectionId} number={number} title={title}>
      <div
        className="markdown-body tahoe-custom-body"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </Section>
  );
}
