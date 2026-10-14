"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function PearlMascot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let timeoutId: number | undefined;
    function onScroll() {
      const currentNode = ref.current;
      if (!currentNode) return;
      currentNode.classList.add("is-scrolling");
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        currentNode.classList.remove("is-scrolling");
      }, 420);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pearl-mascot fy-dog pointer-events-none select-none"
      role="img"
      aria-label="珍珠，黑白色小犬"
    >
      <div className="relative">
        <Image
          src="/images/ip/pearl-stand-body.png"
          alt=""
          width={164}
          height={194}
          className="pearl-mascot-img relative z-[1] w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
          draggable={false}
        />
        <Image
          src="/images/ip/pearl-tail.png"
          alt=""
          width={60}
          height={79}
          className="pearl-tail absolute left-0 top-[23%] z-[2] w-[60px]"
          draggable={false}
        />
      </div>
    </div>
  );
}
