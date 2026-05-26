import type { Highlight, Profile } from "@/content/types";

type HeroProps = {
  profile: Profile;
  highlights: Highlight[];
};

export function Hero({ profile, highlights }: HeroProps) {
  return (
    <section id="home" className="tahoe-hero tahoe-window relative overflow-hidden">
      <WindowDots />
      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
        <div className="relative z-10">
          <p className="tahoe-kicker">Hello, I&apos;m</p>
          <h1 className="mt-4 text-[clamp(3rem,6vw,4.5rem)] font-semibold leading-[1.08] tracking-normal text-[color:var(--tahoe-text)]">
            {profile.nickname}
          </h1>
          <p className="mt-5 max-w-[560px] text-[1.2rem] leading-8 text-[color:var(--tahoe-muted)]">
            {profile.summary}
          </p>
          {profile.bio.length ? (
            <div className="mt-5 max-w-[560px] text-[15px] leading-8 text-[color:var(--tahoe-faint)]">
              {profile.bio.map((item) => (
                <p className="[&+p]:mt-3" key={item}>
                  {item}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="tahoe-system-card relative z-10">
          <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase text-[color:var(--tahoe-accent)]">
            <span className="h-2 w-2 rounded-full bg-[color:var(--tahoe-accent)] shadow-[0_0_0_5px_var(--tahoe-accent-soft)]" />
            Current Status
          </div>
          <div className="space-y-3 text-[14px] leading-7 text-[color:var(--tahoe-muted)]">
            {highlights.map((item) => (
              <p key={item.label}>{item.value}</p>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export function WindowDots() {
  return (
    <div className="tahoe-dots" aria-hidden>
      <span className="bg-[#ff5f57]" />
      <span className="bg-[#febc2e]" />
      <span className="bg-[#28c840]" />
    </div>
  );
}
