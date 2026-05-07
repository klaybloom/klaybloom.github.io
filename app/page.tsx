const links = {
  blog: "https://klaybloom.github.io/",
  lab: "https://klaybloom.github.io/",
  github: "https://github.com/klaybloom",
  email: "mailto:klay@example.com"
};

const navLinks = [
  { label: "Blog", href: links.blog },
  { label: "Project Lab", href: links.lab },
  { label: "GitHub", href: links.github },
  { label: "Email", href: links.email }
];

const skills = [
  {
    label: "Backend",
    items: "Java, Spring Boot, Spring Cloud, MyBatis Plus, JPA, OAuth2"
  },
  {
    label: "Microservices",
    items: "Nacos, Gateway, Redis, RabbitMQ, Docker, Linux, Nginx"
  },
  {
    label: "Database",
    items: "MySQL, SQL Optimization, Transaction, Index, ORM Mapping"
  },
  {
    label: "AI Workflow",
    items: "Dify, n8n, Coze, AI Agent, Automation"
  }
];

const projects = [
  {
    title: "AI 工作流自动化平台",
    description:
      "基于 n8n / Dify / 自定义 API 的自动化流程实践，用于探索 AI Agent 在真实工作中的落地方式。",
    stack: "Java · API · n8n · Dify",
    href: links.lab,
    cta: "查看项目 →"
  },
  {
    title: "视频流媒体服务 Demo",
    description:
      "基于 Java / MinIO / HTTP Range 实现视频文件在线播放，重点关注大文件流式传输与内存风险控制。",
    stack: "Java · MinIO · HTTP Range · Nginx",
    href: links.lab,
    cta: "查看项目 →"
  },
  {
    title: "个人博客系统",
    description:
      "基于 Next.js / MDX 构建的技术博客站，用于沉淀 Java、微服务、AI 工具链相关内容。",
    stack: "Next.js · MDX · SEO · Vercel",
    href: links.blog,
    cta: "查看博客 →"
  }
];

const articles = [
  {
    title: "Nacos 配置不生效的排查思路",
    summary:
      "从配置文件、客户端缓存、服务注册元数据、版本兼容性几个角度分析问题。"
  },
  {
    title: "OAuth2 密码模式完整理解",
    summary:
      "整理 OAuth2 密码模式、客户端认证、用户认证与系统间 token 转换的边界。"
  },
  {
    title: "MinIO 视频流 Range 请求实现",
    summary: "记录从本地 MP4 到 MinIO 对象存储的视频流式播放设计。"
  }
];

const experience = [
  "4 年 Java 后端开发经验，长期参与业务系统开发、接口设计、权限控制、服务部署与问题排查。",
  "熟悉从需求开发、接口联调、数据库设计到线上部署的完整后端开发流程。",
  "关注稳定、可维护的后端服务设计，清晰的权限与数据边界，以及自动化工具提升开发效率。"
];

function Section({
  id,
  title,
  children
}: Readonly<{
  id: string;
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-6 border-l-4 border-notion-accent pl-3 text-[15px] font-semibold text-notion-text">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-notion-bg text-notion-text">
      <header className="sticky top-0 z-20 px-4 py-3 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-[1040px] items-center justify-between gap-6 rounded-[22px] border border-notion-line bg-white/82 px-5 shadow-[0_18px_50px_rgba(31,41,55,0.08)]">
          <a
            href="#"
            className="shrink-0 text-[16px] font-semibold tracking-[0.08em]"
          >
            Klay's Studio
          </a>
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto text-[14px] text-notion-muted">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="shrink-0 rounded-full px-3.5 py-2 transition hover:bg-notion-hover hover:text-notion-text"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-[760px] px-5 pb-16 pt-20">
        <section className="mb-14 text-center">
          <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.45em] text-notion-accent">
            你好，我是
          </p>
          <h1 className="mb-5 font-serif text-6xl font-semibold leading-tight tracking-normal text-notion-text sm:text-7xl">
            klay
          </h1>
          <p className="mx-auto max-w-2xl text-[21px] leading-relaxed text-notion-muted">
            Java 后端开发工程师，专注微服务架构、高并发系统与 AI 工作流自动化。
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxedBody text-notion-muted">
            我正在构建自己的技术作品集：用博客沉淀技术认知，用项目 Demo
            展示工程能力，用持续输出证明成长轨迹。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2 text-[14px]">
            <a
              href={links.blog}
              className="rounded-full border border-notion-accent bg-notion-accent px-4 py-2 font-medium text-white transition hover:bg-[#1f735d]"
            >
              访问博客
            </a>
            <a
              href={links.lab}
              className="rounded-full border border-notion-line bg-white/76 px-4 py-2 transition hover:bg-notion-hover"
            >
              查看项目
            </a>
            <a
              href={links.email}
              className="rounded-full border border-notion-line bg-white/76 px-4 py-2 transition hover:bg-notion-hover"
            >
              联系我
            </a>
          </div>
        </section>

        <div className="space-y-14 rounded-[24px] border border-notion-line bg-notion-paper/92 px-5 py-8 sm:px-8">
          <Section id="status" title="当前状态">
            <div className="border-l-4 border-notion-accent bg-notion-hover/65 py-1 pl-5 text-[15px] leading-relaxedBody text-notion-muted">
              <p>
                正在系统化整理 Java 后端、微服务、AI 工作流相关内容，并持续构建个人项目
                Demo。
              </p>
              <p className="mt-3">
                当前重点方向：个人技术品牌、求职作品集、AI 自动化实践。
              </p>
            </div>
          </Section>

          <Section id="skills" title="技术能力">
            <div className="divide-y divide-notion-line border-y border-notion-line">
              {skills.map((skill) => (
                <div
                  key={skill.label}
                  className="grid gap-2 py-4 text-[15px] leading-relaxed sm:grid-cols-[150px_1fr]"
                >
                  <div className="font-semibold text-notion-accent">
                    {skill.label}
                  </div>
                  <div className="text-notion-muted">{skill.items}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="projects" title="精选项目">
            <div className="divide-y divide-notion-line border-y border-notion-line">
              {projects.map((project) => (
                <article key={project.title} className="py-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-[17px] font-semibold">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxedBody text-notion-muted">
                        {project.description}
                      </p>
                      <p className="mt-3 text-[13px] text-notion-faint">
                        {project.stack}
                      </p>
                    </div>
                    <a
                      href={project.href}
                      className="shrink-0 rounded-full px-3 py-1 text-[14px] font-medium text-notion-accent transition hover:bg-notion-accentSoft"
                    >
                      {project.cta}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="articles" title="技术文章">
            <div className="divide-y divide-notion-line border-y border-notion-line">
              {articles.map((article) => (
                <article key={article.title} className="py-5">
                  <h3 className="text-[16px] font-medium">{article.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxedBody text-notion-muted">
                    {article.summary}
                  </p>
                </article>
              ))}
            </div>
            <a
              href={links.blog}
              className="mt-4 inline-flex rounded-full px-3 py-1 text-[14px] font-medium text-notion-accent transition hover:bg-notion-accentSoft"
            >
              查看全部博客 →
            </a>
          </Section>

          <Section id="experience" title="工作经历">
            <ul className="space-y-4 text-[15px] leading-relaxedBody text-notion-muted">
              {experience.map((item) => (
                <li key={item} className="border-l-4 border-notion-line pl-5">
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="contact" title="联系方式">
            <div className="grid gap-3 border-y border-notion-line py-5 text-[15px] sm:grid-cols-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-3 py-2 text-notion-muted transition hover:bg-notion-hover hover:text-notion-text"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <footer className="border-t border-notion-line/70 bg-white/35">
        <div className="mx-auto flex max-w-[760px] flex-col gap-4 px-5 py-8 text-[13px] text-notion-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 klay</p>
          <div className="flex flex-wrap gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-3 py-1 transition hover:bg-notion-hover hover:text-notion-text"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
