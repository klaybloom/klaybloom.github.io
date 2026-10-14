import { HomeSectionLink } from "@/components/layout/HomeSectionLink";
import type { Highlight, Profile } from "@/content/types";
import { FangyuanIP } from "./FangyuanIP";
import { BannerIcon } from "@/components/layout/BannerIcon";

type HeroProps = { profile: Profile; highlights: Highlight[] };

export function Hero({ profile }: HeroProps) {
  return (
    <section id="home" className="fy-hero-section">
      <div className="fy-hero">
        <div className="fy-hero-copy">
          <p className="fy-eyebrow">{profile.title}</p>
          <h1>你好，我是 {profile.name}。</h1>
          <h2>写代码，也记录<span>思考。</span></h2>
          <p className="fy-intro">专注 Java 后端开发，探索 AI 应用与效率工具。<br />在这里，分享我的项目、实践与观察。</p>
          <div className="fy-actions">
            <HomeSectionLink className="tahoe-button tahoe-button-primary" section="projects">查看项目 <span aria-hidden>↗</span></HomeSectionLink>
            <HomeSectionLink className="tahoe-button tahoe-button-glass fy-glass" section="articles">读我的文章 <BannerIcon name="book" /></HomeSectionLink>
          </div>
          <div className="fy-hero-links">
            <a href={profile.links.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden>↗</span></a>
            <a href={`mailto:${profile.links.email}`}>联系我 <span aria-hidden>↗</span></a>
          </div>
        </div>
        <div className="fy-portrait">
          <div className="fy-halo" aria-hidden />
          <FangyuanIP />
          <HomeSectionLink className="fy-portrait-link fy-portrait-code fy-glass" section="projects"><BannerIcon name="code" /> Java 与 AI</HomeSectionLink>
          <HomeSectionLink className="fy-portrait-link fy-portrait-notes fy-glass" section="articles"><BannerIcon name="pencil" />实践 · 记录 · 分享 <span aria-hidden>↗</span></HomeSectionLink>
        </div>
      </div>

    </section>
  );
}

export function ProfileAbout({ profile, highlights }: HeroProps) {
  return (
    <section id="about" className="fy-about-section" aria-labelledby="about-title">
      <h2 id="about-title">以工程实践，探索新的可能。</h2>
      <p className="fy-about-summary">{profile.summary}</p>
      <details className="fy-profile-details">
        <summary>关于我 · 背景与实践<span aria-hidden>＋</span></summary>
        <div className="fy-profile-grid">
          <div className="fy-bio">{profile.bio.map((item) => <p key={item}>{item}</p>)}</div>
          <aside aria-label="当前关注"><h2>当前关注</h2>{highlights.map((item) => <p key={item.label}>{item.value}</p>)}</aside>
        </div>
      </details>
    </section>
  );
}
