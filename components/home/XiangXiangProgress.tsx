"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function XiangXiangProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function onScroll() {
      const currentNode = ref.current;
      if (!currentNode) return;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0
        ? Math.min(window.scrollY / scrollableHeight, 1)
        : 0;
      currentNode.style.setProperty("--page-progress", String(progress));
      currentNode.style.setProperty("--progress-length", `${Math.max(currentNode.clientHeight - 16, 0)}px`);
      currentNode.style.setProperty(
        "--progress-offset",
        `${progress * Math.max(currentNode.clientHeight - 16, 0)}px`
      );
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <aside
      ref={ref}
      className="xiangxiang-progress pointer-events-none fixed right-6 top-1/2 z-40 hidden h-[210px] w-[64px] -translate-y-1/2 select-none sm:block lg:right-10"
      aria-label="页面阅读进度"
    >
      <div className="xiangxiang-progress-line absolute bottom-2 left-1/2 top-2 -translate-x-1/2" />
      <div className="xiangxiang-progress-fill absolute left-1/2 top-2 w-[2px] -translate-x-1/2 origin-top" />
      <div className="xiangxiang-progress-bird absolute left-1/2 top-2 -translate-x-1/2">
        <Image
          src="/images/ip/xiangxiang-standing.png"
          alt=""
          width={50}
          height={69}
          className="w-[50px] drop-shadow-[0_5px_10px_rgba(0,0,0,0.2)]"
          draggable={false}
        />
      </div>
      <span className="absolute bottom-[-1px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[color:var(--tahoe-accent)]" />
    </aside>
  );
}
