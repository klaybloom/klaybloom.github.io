import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "主题预览 · Liquid Glass",
  description: "macOS 26 Tahoe Liquid Glass 风格主题预览",
};

const samplePosts = [
  {
    title: "Agent Memory 可靠性的几次教训",
    date: "2026-05-19",
    tag: "AI",
    excerpt: "从一次线上 memory drop 谈起，记录长上下文记忆系统在生产环境里的几类常见失稳。",
  },
  {
    title: "Notion AI 团队仪表盘是怎么搭起来的",
    date: "2026-05-18",
    tag: "Tooling",
    excerpt: "我们用 Notion + 自己的 AI Agent 拼出了一个能跑通的小型团队仪表盘，分享一下结构和踩坑。",
  },
  {
    title: "OpenRouter BYOK 与多模型 Key 管理",
    date: "2026-05-17",
    tag: "Infra",
    excerpt: "在 OpenRouter 上用自己的 key 跑多家模型，需要注意的几个工程上的小事。",
  },
];

const sampleProjects = [
  { name: "klay-studio", role: "个人主站", color: "from-rose-200 to-amber-200" },
  { name: "memory-lab", role: "Agent memory 实验台", color: "from-sky-200 to-violet-200" },
  { name: "wechat-flow", role: "公众号自动化", color: "from-emerald-200 to-teal-200" },
];

export default function ThemePreviewPage() {
  return (
    <div
      data-glass
      className="glass-wallpaper relative min-h-screen overflow-hidden"
    >
      {/* subtle grain layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* floating header */}
      <div className="sticky top-4 z-30 px-4 sm:px-6">
        <div className="glass-bar mx-auto flex max-w-[1080px] items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-pink-300 via-violet-300 to-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]" />
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: "rgb(var(--glass-text))" }}>
              klay&#39;s studio
            </span>
          </div>
          <nav className="hidden gap-1 text-[14px] sm:flex" style={{ color: "rgb(var(--glass-text-2))" }}>
            <a className="rounded-full px-3 py-1.5 transition hover:bg-white/40 hover:text-[rgb(var(--glass-text))]" href="#">主页</a>
            <a className="rounded-full px-3 py-1.5 transition hover:bg-white/40 hover:text-[rgb(var(--glass-text))]" href="#">博客</a>
            <a className="rounded-full px-3 py-1.5 transition hover:bg-white/40 hover:text-[rgb(var(--glass-text))]" href="#">作品</a>
            <a className="rounded-full px-3 py-1.5 transition hover:bg-white/40 hover:text-[rgb(var(--glass-text))]" href="#">关于</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              className="glass-pill flex h-9 w-9 items-center justify-center transition hover:scale-105 active:scale-95"
              aria-label="切换主题"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgb(var(--glass-text-2))" }}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-[1080px] px-4 pb-32 pt-12 sm:px-6">
        {/* note banner */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 text-[13px]" style={{ color: "rgb(var(--glass-text-2))" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgb(var(--glass-accent))" }} />
            主题预览 · 仅本页应用，不影响其他页面
          </span>
        </div>

        {/* hero */}
        <section className="glass-thick relative mb-10 p-10 sm:p-14">
          <div className="absolute right-8 top-8 flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]/80" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]/80" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]/80" />
          </div>
          <div className="max-w-xl">
            <span className="glass-pill mb-5 inline-flex items-center px-3 py-1 text-[12px] font-medium" style={{ color: "rgb(var(--glass-text-2))" }}>
              Liquid Glass · macOS 26 风格
            </span>
            <h1 className="mb-4 text-[2.6rem] font-semibold leading-[1.1] tracking-tight" style={{ color: "rgb(var(--glass-text))" }}>
              透明、有光、有层次的<br />新主题
            </h1>
            <p className="mb-7 text-[16px] leading-[1.65]" style={{ color: "rgb(var(--glass-text-2))" }}>
              壁纸做底，毛玻璃做表层，描边只是 1px 半透明白把光收住。
              滚动时不同卡片在同一张背景上漂浮，是 Apple 在 macOS 26 Tahoe 里
              主推的视觉语言。
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="glass-tint-blue rounded-full px-5 py-2.5 text-[14px] font-medium transition hover:brightness-110 active:scale-[0.98]">
                我喜欢，铺到全站
              </button>
              <button className="glass-surface rounded-full px-5 py-2.5 text-[14px] font-medium transition hover:bg-white/70 active:scale-[0.98]" style={{ color: "rgb(var(--glass-text))" }}>
                再调一调
              </button>
            </div>
          </div>
        </section>

        {/* 3-col cards */}
        <section className="mb-10">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[22px] font-semibold tracking-tight" style={{ color: "rgb(var(--glass-text))" }}>
              最近文章
            </h2>
            <a href="#" className="text-[13px] font-medium" style={{ color: "rgb(var(--glass-accent) / 1)" }}>
              全部 →
            </a>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {samplePosts.map((p) => (
              <article key={p.title} className="glass-surface glass-hover p-6">
                <div className="mb-3 flex items-center justify-between text-[12px]" style={{ color: "rgb(var(--glass-text-3))" }}>
                  <span>{p.date}</span>
                  <span className="glass-pill px-2.5 py-0.5">{p.tag}</span>
                </div>
                <h3 className="mb-2 text-[16px] font-semibold leading-snug tracking-tight" style={{ color: "rgb(var(--glass-text))" }}>
                  {p.title}
                </h3>
                <p className="text-[14px] leading-[1.6]" style={{ color: "rgb(var(--glass-text-2))" }}>
                  {p.excerpt}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* projects strip */}
        <section className="mb-10">
          <h2 className="mb-5 text-[22px] font-semibold tracking-tight" style={{ color: "rgb(var(--glass-text))" }}>
            进行中的项目
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {sampleProjects.map((p) => (
              <div key={p.name} className="glass-surface glass-hover overflow-hidden">
                <div className={`h-28 bg-gradient-to-br ${p.color}`} />
                <div className="p-5">
                  <h3 className="mb-1 text-[15px] font-semibold tracking-tight" style={{ color: "rgb(var(--glass-text))" }}>
                    {p.name}
                  </h3>
                  <p className="text-[13px]" style={{ color: "rgb(var(--glass-text-2))" }}>
                    {p.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* markdown sample + code */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="glass-thick p-8 sm:p-10">
            <h2 className="mb-3 text-[26px] font-semibold tracking-tight" style={{ color: "rgb(var(--glass-text))" }}>
              正文示例
            </h2>
            <p className="mb-5 text-[15px] leading-[1.75]" style={{ color: "rgb(var(--glass-text-2))" }}>
              这一段是普通正文。可以观察一下行高、字色和半透明卡片的对比。
              玻璃材质的关键在于<strong style={{ color: "rgb(var(--glass-text))" }}>顶部那一道亮高光</strong>，
              没有它就只是个磨砂方块。
            </p>
            <h3 className="mb-2 mt-7 text-[18px] font-semibold tracking-tight" style={{ color: "rgb(var(--glass-text))" }}>
              小标题 H3
            </h3>
            <blockquote className="my-5 border-l-2 pl-4 italic" style={{ borderColor: "rgb(var(--glass-accent) / 0.5)", color: "rgb(var(--glass-text-2))" }}>
              引用块在玻璃材质上，用一条 accent 色的细线，比块状底色更克制。
            </blockquote>
            <ul className="space-y-2 text-[15px]" style={{ color: "rgb(var(--glass-text-2))" }}>
              <li>· 列表项一：壁纸定调，玻璃做层</li>
              <li>· 列表项二：圆角 18–28px，更接近原生</li>
              <li>· 列表项三：accent 用 system blue #007aff，可改墨绿</li>
            </ul>
          </article>

          <aside className="space-y-5">
            <div className="glass-code p-5">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <pre className="overflow-x-auto font-mono text-[12.5px] leading-[1.7]">
{`function applyGlass(el) {
  el.style.backdropFilter =
    'blur(22px) saturate(180%)';
  el.style.background =
    'rgba(255,255,255,0.55)';
  el.style.border =
    '1px solid rgba(255,255,255,0.55)';
  return el;
}`}
              </pre>
            </div>

            <div className="glass-surface p-5">
              <h4 className="mb-3 text-[13px] font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--glass-text-3))" }}>
                调色板
              </h4>
              <div className="space-y-2.5">
                {[
                  { name: "Text", hex: "#1d1d1f", swatch: "#1d1d1f" },
                  { name: "Secondary", hex: "#6e6e73", swatch: "#6e6e73" },
                  { name: "Accent · Blue", hex: "#007aff", swatch: "#007aff" },
                  { name: "Glass fill", hex: "rgba(255,255,255,.55)", swatch: "rgba(255,255,255,.55)" },
                  { name: "Wallpaper base", hex: "#f3f4f8", swatch: "#f3f4f8" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-5 w-5 rounded-md ring-1 ring-black/10"
                        style={{ background: c.swatch }}
                      />
                      <span className="text-[13px]" style={{ color: "rgb(var(--glass-text))" }}>{c.name}</span>
                    </div>
                    <code className="font-mono text-[11.5px]" style={{ color: "rgb(var(--glass-text-3))" }}>{c.hex}</code>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <footer className="mt-12 text-center text-[12px]" style={{ color: "rgb(var(--glass-text-3))" }}>
          预览路由 · <code className="font-mono">/theme-preview</code> · 调好之后再接进 Header 切换
        </footer>
      </main>
    </div>
  );
}
