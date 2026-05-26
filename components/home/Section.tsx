import Link from "next/link";
import type { ReactNode } from "react";

type SectionProps = {
  actionHref?: string;
  actionLabel?: string;
  id: string;
  number: string;
  title: string;
  children: ReactNode;
};

export function Section({
  actionHref,
  actionLabel,
  id,
  number,
  title,
  children,
}: SectionProps) {
  return (
    <section id={id}>
      <div className="tahoe-section-head">
        <div className="flex min-w-0 items-baseline gap-4">
          <span className="text-[13px] font-semibold tracking-normal text-[color:var(--tahoe-faint)]">
            {number}
          </span>
          <h2 className="text-[1.5rem] font-semibold text-[color:var(--tahoe-text)]">
            {title}
          </h2>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="tahoe-section-action">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
