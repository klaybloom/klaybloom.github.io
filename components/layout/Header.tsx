import Link from "next/link";
import type { NavItem } from "@/content/types";

type HeaderProps = {
  name: string;
  nav: NavItem[];
};

export function Header({ name, nav }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 px-4 py-3 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1040px] items-center justify-between gap-6 rounded-[22px] border border-notion-line bg-white/82 px-5 shadow-[0_18px_50px_rgba(31,41,55,0.08)]">
        <a
          href="#"
          className="shrink-0 text-[16px] font-semibold tracking-[0.08em]"
        >
          {name}
        </a>
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto text-[14px] text-notion-muted">
          {nav.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                href={link.href}
                className="shrink-0 rounded-full px-3.5 py-2 transition hover:bg-notion-hover hover:text-notion-text"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="shrink-0 rounded-full px-3.5 py-2 transition hover:bg-notion-hover hover:text-notion-text"
              >
                {link.label}
              </a>
            )
          )}
        </div>
      </nav>
    </header>
  );
}
