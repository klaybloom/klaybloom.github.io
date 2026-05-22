import Link from "next/link";
import type { NavItem } from "@/content/types";

type HeaderProps = {
  name: string;
  nav: NavItem[];
};

export function Header({ name, nav }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-notion-line bg-notion-bg/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="shrink-0 font-serif text-[1.15rem] font-semibold tracking-wide text-notion-text transition hover:text-notion-accent"
        >
          {name}
        </Link>
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto text-[14px] font-medium text-notion-muted">
          {nav.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                href={link.href}
                className="magnetic relative shrink-0 px-3.5 py-2 transition hover:text-notion-text [&:hover::after]:scale-x-100 after:absolute after:bottom-[6px] after:left-[14px] after:right-[14px] after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-notion-accent after:transition-transform after:duration-300"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="magnetic relative shrink-0 px-3.5 py-2 transition hover:text-notion-text [&:hover::after]:scale-x-100 after:absolute after:bottom-[6px] after:left-[14px] after:right-[14px] after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-notion-accent after:transition-transform after:duration-300"
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
