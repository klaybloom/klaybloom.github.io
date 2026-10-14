"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/content/types";
import { TahoeModeToggle } from "./TahoeModeToggle";
import { BannerIcon } from "./BannerIcon";
import { HomeSectionLink } from "./HomeSectionLink";

type HeaderProps = { name: string; nav: NavItem[] };
const HOME_SECTIONS = ["home", "projects", "articles", "about"] as const;
type HomeSection = (typeof HOME_SECTIONS)[number];

export function Header({ name, nav }: HeaderProps) {
  const pathname = usePathname() ?? "/";
  const headerRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<HomeSection>("home");

  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    let disposed = false;
    // Preserve anchor intent when multiple short sections share the same bottom scroll position.
    let requestedSection = window.location.hash.slice(1);

    function updateActiveSection() {
      frame = 0;
      const sections = HOME_SECTIONS.flatMap((id) => {
        const element = document.getElementById(id);
        return element ? [{ id, element }] : [];
      });
      const activationLine = (headerRef.current?.getBoundingClientRect().bottom ?? 90) + 30;
      let current: HomeSection = "home";
      for (const section of sections) {
        if (section.element.getBoundingClientRect().top <= activationLine) {
          current = section.id;
        }
      }
      // Short final sections cannot always reach the header before scrolling ends.
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = sections.at(-1)?.id ?? current;
      }
      if (sections.some((section) => section.id === requestedSection)) {
        current = requestedSection as HomeSection;
      }
      setActiveSection(current);
    }

    function scheduleUpdate() {
      if (!disposed && !frame) frame = requestAnimationFrame(updateActiveSection);
    }

    function onAnchorClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!anchor) return;
      const url = new URL(anchor.getAttribute("href")!, window.location.href);
      if (url.origin === window.location.origin && url.pathname === "/") {
        requestedSection = url.hash.slice(1);
        scheduleUpdate();
      }
    }

    function onHistoryNavigation() {
      requestedSection = window.location.hash.slice(1);
      scheduleUpdate();
    }

    function onManualScroll() {
      requestedSection = "";
      scheduleUpdate();
    }

    function onScrollbarPointerDown(event: PointerEvent) {
      if (event.clientX >= document.documentElement.clientWidth) onManualScroll();
    }

    function onScrollKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) onManualScroll();
    }

    scheduleUpdate();
    document.addEventListener("click", onAnchorClick, true);
    window.addEventListener("wheel", onManualScroll, { passive: true });
    window.addEventListener("touchmove", onManualScroll, { passive: true });
    window.addEventListener("pointerdown", onScrollbarPointerDown, { passive: true });
    window.addEventListener("keydown", onScrollKey);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", onHistoryNavigation);
    window.addEventListener("popstate", onHistoryNavigation);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleUpdate) : null;
    const main = document.querySelector("main");
    if (main) observer?.observe(main);
    document.fonts?.ready.then(scheduleUpdate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("click", onAnchorClick, true);
      window.removeEventListener("wheel", onManualScroll);
      window.removeEventListener("touchmove", onManualScroll);
      window.removeEventListener("pointerdown", onScrollbarPointerDown);
      window.removeEventListener("keydown", onScrollKey);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", onHistoryNavigation);
      window.removeEventListener("popstate", onHistoryNavigation);
    };
  }, [pathname]);

  const primaryNav = [
    { label: "首页", href: "/#home", section: "home", route: "/" },
    ...nav.filter((link) => link.href.startsWith("/"))
      .sort((a, b) => Number(b.href === "/projects") - Number(a.href === "/projects"))
      .map((link) => {
        if (link.href === "/projects") return { label: "项目", href: "/#projects", section: "projects", route: "/projects" };
        if (link.href === "/blog") return { label: "文章", href: "/#articles", section: "articles", route: "/blog" };
        return { ...link, section: "", route: link.href };
      }),
    { label: "关于", href: "/#about", section: "about", route: "" },
  ];
  const github = nav.find((link) => link.href.startsWith("https://github.com/"));

  return (
    <header ref={headerRef} className="tahoe-menubar fy-banner-header">
      <HomeSectionLink section="home" className="tahoe-brand" aria-label="返回首页">
        <span className="tahoe-brand-mark" aria-hidden>K</span><span>{name}</span>
      </HomeSectionLink>
      <nav className="tahoe-banner-nav" aria-label="主导航">
        {primaryNav.map((link) => {
          const selected = pathname === "/"
            ? activeSection === link.section
            : link.route !== "" && link.route !== "/" && (pathname === link.route || pathname.startsWith(`${link.route}/`));
          return (
            <a
              href={link.href}
              key={link.href}
              className={link.section === "home" ? "fy-nav-home" : undefined}
              aria-current={selected ? pathname === "/" ? "location" : "page" : undefined}
            >
              {link.label}
            </a>
          );
        })}
        <span className="fy-nav-separator" aria-hidden />
        {github && <a className="fy-nav-github" href={github.href} aria-label="GitHub" target="_blank" rel="noreferrer"><BannerIcon name="github" /></a>}
        <TahoeModeToggle direct />
      </nav>
    </header>
  );
}
