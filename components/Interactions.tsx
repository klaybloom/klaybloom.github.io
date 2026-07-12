"use client";

import { useEffect } from "react";

export function Interactions() {
  useEffect(() => {
    // ========== SCROLL ANIMATIONS ==========
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

    // ========== HEADER SHADOW ==========
    const header = document.querySelector("header");
    function onScroll() {
      if (header) {
        header.classList.toggle("shadow-sm", window.scrollY > 10);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}
