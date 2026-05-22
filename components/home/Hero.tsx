import type { Highlight, Profile } from "@/content/types";

type HeroProps = {
  profile: Profile;
  highlights: Highlight[];
};

export function Hero({ profile, highlights }: HeroProps) {
  return (
    <section className="mb-16 grid items-start gap-16 pt-4 lg:mb-20 lg:grid-cols-[1fr_300px]">
      <div className="animate-on-scroll stagger-1">
        <p className="mb-5 font-mono text-[13px] font-medium uppercase tracking-[0.15em] text-notion-accent">
          Hello, I&apos;m
        </p>
        <h1 className="mb-5 font-serif text-[clamp(3rem,6vw,4.5rem)] font-bold leading-[1.1] text-notion-text">
          <em className="text-notion-accent">{profile.nickname}</em>
        </h1>
        <p className="mb-5 max-w-[540px] text-[1.2rem] leading-relaxed text-notion-muted">
          {profile.summary}
        </p>
        <div className="max-w-[540px] text-[15px] leading-[1.8] text-notion-faint">
          {profile.bio.map((item) => (
            <p className="[&+p]:mt-3" key={item}>
              {item}
            </p>
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 animate-on-scroll stagger-2">
        <div className="rounded-xl border border-notion-line bg-notion-paper p-6 text-[14px] leading-relaxed text-notion-muted">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-notion-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            Current Status
          </div>
          {highlights.map((item, index) => (
            <p className={index === 0 ? undefined : "mt-3"} key={item.label}>
              {item.value}
            </p>
          ))}
        </div>
      </aside>
    </section>
  );
}
