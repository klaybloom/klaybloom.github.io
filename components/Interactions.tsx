"use client";

import { useEffect } from "react";

export function Interactions() {
  useEffect(() => {
    // ========== CUSTOM CURSOR ==========
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);

    let cursorVisible = false;

    function onMove(e: MouseEvent) {
      dot.style.left = `${e.clientX - 3}px`;
      dot.style.top = `${e.clientY - 3}px`;
      if (!cursorVisible) {
        dot.style.opacity = "1";
        cursorVisible = true;
      }
    }

    function onLeave() {
      dot.style.opacity = "0";
      cursorVisible = false;
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    // ========== CLICK RIPPLE ==========
    function onClick(e: MouseEvent) {
      const ripple = document.createElement("div");
      ripple.className = "click-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());

      for (let i = 0; i < 6; i++) {
        const particle = document.createElement("div");
        const angle = (Math.PI * 2 / 6) * i;
        const dist = 30 + Math.random() * 20;
        Object.assign(particle.style, {
          position: "fixed",
          left: `${e.clientX}px`,
          top: `${e.clientY}px`,
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: "#2d5a3d",
          pointerEvents: "none",
          zIndex: "9996",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: "1",
          transform: "translate(-50%, -50%)"
        });
        document.body.appendChild(particle);
        requestAnimationFrame(() => {
          particle.style.transform = `translate(${Math.cos(angle) * dist - 2}px, ${Math.sin(angle) * dist - 2}px)`;
          particle.style.opacity = "0";
        });
        setTimeout(() => particle.remove(), 600);
      }
    }

    document.addEventListener("click", onClick);

    // ========== MAGNETIC HOVER ==========
    const magnetics = document.querySelectorAll<HTMLElement>(".magnetic");
    magnetics.forEach((el) => {
      function onElMove(e: MouseEvent) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      }
      function onElLeave() {
        el.style.transform = "translate(0, 0)";
      }
      el.addEventListener("mousemove", onElMove);
      el.addEventListener("mouseleave", onElLeave);
    });

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
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      dot.remove();
    };
  }, []);

  return null;
}
