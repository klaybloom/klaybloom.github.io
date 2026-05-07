import Link from "next/link";
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
      <div className="mt-8 flex flex-wrap justify-center gap-2 text-[14px]">
        <Link
          href={profile.links.blog}
          className="rounded-full border border-notion-accent bg-notion-accent px-4 py-2 font-medium text-white transition hover:bg-[#1f735d]"
        >
          访问博客
        </Link>
        <Link
          href={profile.links.projects}
          className="rounded-full border border-notion-line bg-white/76 px-4 py-2 transition hover:bg-notion-hover"
        >
          查看项目
        </Link>
        <a
          href={profile.links.email}
          className="rounded-full border border-notion-line bg-white/76 px-4 py-2 transition hover:bg-notion-hover"
        >
          联系我
        </a>
      </div>
    </section>
  );
}
