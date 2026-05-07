export function Section({
  id,
  title,
  children
}: Readonly<{
  id: string;
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-6 border-l-4 border-notion-accent pl-3 text-[15px] font-semibold text-notion-text">
        {title}
      </h2>
      {children}
    </section>
  );
}
