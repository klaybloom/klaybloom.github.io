"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function FangyuanIP() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // 鼠标跟随：轻微横向偏移和旋转
    let raf = 0;
    let targetX = 0;
    let targetRot = 0;
    let currentX = 0;
    let currentRot = 0;

    function onPointerMove(e: PointerEvent) {
      const centerX = window.innerWidth / 2;
      const dx = e.clientX - centerX;
      targetX = (dx / window.innerWidth) * 22;
      targetRot = (dx / window.innerWidth) * 6;
    }

    function update() {
      currentX += (targetX - currentX) * 0.08;
      currentRot += (targetRot - currentRot) * 0.08;
      const node = ref.current;
      if (!node) return;
      node.style.translate = `${currentX}px 0px`;
      node.style.rotate = `${currentRot}deg`;
      raf = requestAnimationFrame(update);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fangyuan-ip pointer-events-none absolute right-1 top-10 z-0 hidden w-[150px] select-none sm:block lg:right-6 lg:top-12 lg:w-[200px] xl:right-16 xl:top-10 xl:w-[220px]"
      aria-hidden
    >
      <Image
        src="/images/ip/fangyuan-wave.png"
        alt=""
        width={220}
        height={240}
        className="fangyuan-ip-img w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.2)]"
        draggable={false}
        priority
      />
    </div>
  );
}
