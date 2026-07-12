"use client";

import { useEffect, useState } from "react";

export function TOCScrollActive() {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = reduceMotion ? "auto" : "smooth";

    const headings = Array.from(document.querySelectorAll(".markdown-body h2, .markdown-body h3"));
    if (headings.length === 0) {
      return () => {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      };
    }

    function handleScroll() {
      // Offset of 160px for the sticky header
      const scrollPosition = window.scrollY + 160;
      
      let currentActiveId = "";
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i] as HTMLElement;
        if (heading.offsetTop <= scrollPosition) {
          currentActiveId = heading.id;
        } else {
          break; // Headings are in DOM order, so we can stop searching
        }
      }

      // Default to empty if near the top
      if (window.scrollY < 100) {
        currentActiveId = "";
      }

      setActiveId(currentActiveId);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Dynamic styling injection for active TOC link
    const tocLinks = document.querySelectorAll("aside nav a");
    tocLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === `#${activeId}`) {
        link.classList.add("is-toc-active");
        link.setAttribute("aria-current", "location");
        (link as HTMLElement).style.color = "var(--tahoe-accent)";
        (link as HTMLElement).style.fontWeight = "600";
        (link as HTMLElement).style.paddingLeft = "12px";
        (link as HTMLElement).style.borderLeft = "2px solid var(--tahoe-accent)";
        (link as HTMLElement).style.background = "var(--tahoe-accent-soft)";
      } else {
        link.classList.remove("is-toc-active");
        link.removeAttribute("aria-current");
        (link as HTMLElement).style.color = "var(--tahoe-muted)";
        (link as HTMLElement).style.fontWeight = "400";
        (link as HTMLElement).style.paddingLeft = "8px";
        (link as HTMLElement).style.borderLeft = "2px solid transparent";
        (link as HTMLElement).style.background = "transparent";
      }
    });
  }, [activeId]);

  return null;
}
