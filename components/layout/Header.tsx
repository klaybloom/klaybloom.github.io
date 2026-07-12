import Link from "next/link";
import type { NavItem } from "@/content/types";
import { TahoeModeToggle } from "./TahoeModeToggle";

type HeaderProps = {
  name: string;
  nav: NavItem[];
};

export function Header({ name, nav }: HeaderProps) {
  const primaryNav = nav.filter((link) => link.href.startsWith("/"));

  return (
    <header className="tahoe-menubar flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5">
      <Link href="/" className="tahoe-brand" aria-label="返回首页">
        <span className="tahoe-brand-mark">K</span>
        <span>{name}</span>
      </Link>
      <div className="tahoe-banner-nav">
        {primaryNav.map((link) => (
          <Link href={link.href} key={link.label}>
            {link.label}
          </Link>
        ))}
        <a href="/rss.xml">RSS</a>
        <TahoeModeToggle iconOnly />
      </div>
    </header>
  );
}
