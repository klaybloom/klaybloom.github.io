import type { Profile } from "@/content/types";

type HeroProps = {
  profile: Profile;
};

export function Hero({ profile }: HeroProps) {
  return (
    <section className="mb-14 text-center">
      <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.45em] text-notion-accent">
        你好，我是
      </p>
      <h1 className="mb-5 font-serif text-6xl font-semibold leading-tight tracking-normal text-notion-text sm:text-7xl">
        {profile.nickname}
      </h1>
      <p className="mx-auto max-w-2xl text-[21px] leading-relaxed text-notion-muted">
        {profile.summary}
      </p>
      {profile.bio.map((item) => (
        <p
          className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxedBody text-notion-muted"
          key={item}
        >
          {item}
        </p>
      ))}
    </section>
  );
}
