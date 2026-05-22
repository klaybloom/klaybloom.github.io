export function Section({
  id,
  number,
  title,
  children
}: Readonly<{
  id: string;
  number?: string;
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-8 flex items-baseline gap-4 border-b border-notion-line pb-3">
        {number ? (
          <span className="font-mono text-[13px] font-medium tracking-wide text-notion-faint">
            {number}
          </span>
        ) : null}
        <h2 className="font-serif text-[1.5rem] font-semibold text-notion-text">
          {title}
        </h2>
        <span className="h-px flex-1 bg-notion-line" />
      </div>
      {children}
    </section>
  );
}
