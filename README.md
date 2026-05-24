# klay 个人主站

这是 `klaybloom.github.io` 的源码仓库，包含个人主页、博客、项目作品集和一个内容管理后台。项目基于 Next.js App Router，内容主要由本仓库里的 JSON、Markdown 和 TypeScript 文件驱动，构建后以静态站点发布到 GitHub Pages。

在线地址：<https://klaybloom.github.io/>

源码仓库：<https://github.com/klaybloom/klaybloom.github.io>

更新记录：[CHANGELOG.md](./CHANGELOG.md)

## 项目能力

- 首页：展示个人简介、技能、精选项目、最新文章、经历和自定义 Markdown 区块。
- 博客：读取 `content/posts/*.md`，支持 Front Matter、GFM、代码高亮、标题锚点、标签筛选和文章详情页。
- 项目页：读取 `content/projects.json`，支持项目列表、技术栈筛选和详情页。
- 后台管理：访问 `/admin` 可编辑 profile、experience、projects、skills、posts 和首页区块。
- 本地内容保存：开发环境下后台通过 `scripts/dev-server.mjs` 写入本地文件。
- 线上内容保存：部署后的后台可用 GitHub PAT 调 GitHub Contents API，把修改提交回仓库。
- 静态部署：生产构建使用 `output: "export"`，GitHub Actions 将 `out/` 发布到 GitHub Pages。
- 站点发现：自动生成 `sitemap.xml`、`robots.txt` 和 `rss.xml`。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Markdown + Front Matter
- `unified` / `remark-gfm` / `rehype-highlight`
- GitHub Pages
- GitHub Actions

## 目录结构

```txt
app/
  page.tsx                    # 首页，按 content/home-sections.json 渲染区块
  blog/
    page.tsx                  # 博客列表
    [slug]/page.tsx           # 博客详情
  projects/
    page.tsx                  # 项目列表
    [slug]/page.tsx           # 项目详情
  admin/page.tsx              # 内容管理后台
  api/admin/*                 # 静态导出占位接口，本地写文件不走这些 route

components/
  home/                       # 首页区块组件
  blog/                       # 博客列表和筛选组件
  projects/                   # 项目列表和筛选组件
  layout/                     # Header / Footer

content/
  profile.json                # 个人信息
  skills.json                 # 技能分组
  experience.json             # 经历
  projects.json               # 项目数据
  home-sections.json          # 首页区块顺序、开关和参数
  posts/*.md                  # 博客文章
  *.ts                        # JSON 数据的类型化导出和站点配置

lib/
  posts.ts                    # 文章读取、排序、封面规则、标签聚合
  projects.ts                 # 项目读取、排序、筛选数据
  markdown.ts                 # Markdown 转安全 HTML
  home-sections.ts            # 首页区块定义和数据清洗

public/images/
  default-cover.jpg
  posts/                      # 文章图片
  projects/                   # 项目图片
  uploads/                    # 后台上传图片默认保存位置

scripts/
  dev-server.mjs              # 本地后台写文件服务，端口 8081

docs/
  CONTENT_GUIDE.md            # 内容维护补充说明
  templates/                  # 文章和项目模板
```

## 本地开发

先安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

这个命令会同时启动两部分：

- Next.js dev server：<http://localhost:3000>
- 本地后台写文件服务：<http://localhost:8081>

开发时常用页面：

- 首页：<http://localhost:3000/>
- 博客：<http://localhost:3000/blog/>
- 项目：<http://localhost:3000/projects/>
- 后台：<http://localhost:3000/admin/>

本地打开 `/admin` 时，页面会识别 `localhost` 开发环境，并通过 `http://localhost:8081/api/admin/*` 读取和写入仓库里的内容文件。保存 profile、skills、experience、projects、home sections 和 posts 后，真实文件会被修改。

## 常用命令

```bash
npm run dev
```

启动开发服务器和本地后台写文件服务。

```bash
npm run build
```

生产构建。生产环境下 Next.js 会静态导出，构建产物在 `out/`。

```bash
npm run lint
```

运行 ESLint。当前仓库的 admin 页面还有一些既有 lint 问题，如果只验证静态构建，以 `npm run build` 为主要信号。

```bash
npm run start
```

Next.js 的生产启动命令。这个项目主要面向静态导出和 GitHub Pages，日常开发不需要用它。

## 内容来源

当前项目的内容模型有两类：

1. JSON 内容文件：后台主要编辑这些文件。
2. Markdown 文章：博客正文放在 `content/posts`。

TypeScript 文件如 `content/profile.ts`、`content/projects.ts`、`content/skills.ts` 只是把 JSON 数据导出给页面使用。大多数内容更新优先改 JSON 或通过后台保存。

## 使用后台管理内容

### 本地后台

本地后台适合日常维护和开发调试。

1. 运行 `npm run dev`。
2. 打开 <http://localhost:3000/admin/>。
3. 在侧边栏选择要编辑的内容。
4. 保存后检查 git diff。
5. 运行 `npm run build`。
6. 提交并推送。

本地后台会写入这些文件：

- `content/profile.json`
- `content/experience.json`
- `content/projects.json`
- `content/skills.json`
- `content/home-sections.json`
- `content/posts/*.md`
- `public/images/uploads/*`

### 线上后台

部署后的 `/admin` 不能直接写服务器文件，它会把修改提交到 GitHub 仓库。

使用方式：

1. 打开线上 `/admin`。
2. 输入 GitHub PAT、仓库名和分支名。
3. 默认仓库是 `klaybloom/klaybloom.github.io`，默认分支是 `main`。
4. 后台会读取仓库内容并保存 token 到浏览器 `localStorage`。
5. 保存内容时，后台会通过 GitHub API 直接创建 commit。
6. push 到 `main` 后 GitHub Actions 会自动重新部署站点。

PAT 至少需要能读取和写入目标仓库内容。不要把 PAT 写入仓库文件。

## 首页布局

首页布局由 `content/home-sections.json` 控制。它决定首页区块的顺序、开关和参数。

默认区块：

- `hero`：顶部个人介绍。
- `skills`：技术能力。
- `latest-projects`：精选项目。
- `latest-posts`：最新文章。
- `experience`：工作经历。
- `custom`：自定义 Markdown 内容区块。

示例：

```json
{
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "enabled": true,
      "params": {}
    },
    {
      "id": "latest-posts",
      "type": "latest-posts",
      "enabled": true,
      "params": {
        "title": "技术文章",
        "count": 3
      }
    },
    {
      "id": "custom-hello",
      "type": "custom",
      "enabled": true,
      "params": {
        "title": "自定义区块",
        "body": "这里支持 **Markdown**。"
      }
    }
  ]
}
```

说明：

- `enabled: false` 会隐藏该区块。
- `latest-projects` 和 `latest-posts` 的 `count` 控制展示数量。
- `custom` 的 `body` 会按 Markdown 渲染。
- 如果配置为空或格式不合法，页面会回到默认首页区块。
- 通过后台的「首页布局」标签页可以调整顺序、开关、标题、展示数量和自定义内容。

## 维护个人信息

个人信息在 `content/profile.json`。

主要字段：

- `name`：真实姓名或展示名。
- `nickname`：首页主标题使用的名字。
- `title`：职业标题。
- `summary`：一句话摘要。
- `bio`：简介段落数组。
- `links.github`：GitHub 地址。
- `links.blog`：博客入口。
- `links.projects`：项目入口。
- `links.email`：邮箱。

站点标题、描述、URL 和导航在 `content/site.ts`。

## 维护技能和经历

技能在 `content/skills.json`：

```json
{
  "skills": [
    {
      "group": "Backend",
      "items": ["Java", "Spring Boot", "MySQL"]
    }
  ]
}
```

经历在 `content/experience.json`：

```json
{
  "experience": [
    {
      "period": "2024 - Now",
      "title": "Backend Engineer",
      "company": "Example",
      "description": ["负责业务系统开发。"]
    }
  ]
}
```

## 维护项目

项目数据在 `content/projects.json`。新增项目时添加到 `projects` 数组：

```json
{
  "title": "Project Name",
  "slug": "project-name",
  "description": "一句话简介。",
  "longDescription": "更完整的项目说明。",
  "stack": ["Next.js", "TypeScript"],
  "category": "Personal Site",
  "cover": "/images/projects/project-name.png",
  "github": "https://github.com/klaybloom/project-name",
  "demo": "https://example.com",
  "date": "2026-05-24",
  "updated": "2026-05-24",
  "status": "building",
  "featured": true,
  "pinned": false
}
```

字段说明：

- `slug` 会成为详情页路径：`/projects/{slug}/`。
- `stack` 用于项目页技术栈筛选。
- `featured: true` 后可被首页「精选项目」区块展示。
- `date` 影响项目排序。
- `cover` 建议放在 `public/images/projects/`，引用路径写成 `/images/projects/file-name.png`。

可用状态：

- `planning`
- `building`
- `launched`
- `paused`
- `archived`

注意：后台表单目前的项目状态选项比类型定义少，手动编辑 JSON 时以 `content/types.ts` 的类型为准。

## 维护博客文章

文章放在 `content/posts/`。文件名就是文章 URL slug。

```txt
content/posts/2026-05-24-my-post.md
/blog/2026-05-24-my-post/
```

Front Matter 示例：

```md
---
title: "文章标题"
date: "2026-05-24"
updated: "2026-05-24"
description: "文章摘要，会显示在列表和卡片中。"
tags:
  - AI
  - Engineering
category: "技术观察"
cover: "/images/posts/2026-05-24-my-post/cover.png"
published: true
featured: false
---

正文内容。
```

字段说明：

- `title`：文章标题。缺失时会用 slug。
- `date`：发布日期。缺失时会尝试从文件名提取 `YYYY-MM-DD`。
- `updated`：更新日期。
- `description`：列表摘要。
- `tags`：标签，用于博客页筛选。
- `category`：分类。
- `cover`：封面图。
- `published: false`：隐藏文章，不生成详情页。
- `featured`：已解析，当前不单独控制首页展示。

封面优先级：

1. Front Matter 的 `cover`。
2. 正文第一张 Markdown 图片。
3. `/images/default-cover.jpg`。

图片建议按文章建目录：

```txt
public/images/posts/2026-05-24-my-post/cover.png
public/images/posts/2026-05-24-my-post/image-01.png
```

Markdown 中引用：

```md
![说明文字](/images/posts/2026-05-24-my-post/image-01.png)
```

文章模板在 `docs/templates/post-template.md`。

## 图片上传和路径

后台上传图片时，默认保存到：

```txt
public/images/uploads/
```

返回给正文使用的路径是：

```txt
/images/uploads/file-name.png
```

长期维护时建议把正式文章图片移动到 `public/images/posts/{slug}/`，项目图片放到 `public/images/projects/`。这样路径更清晰，也方便后续迁移。

后台会对上传图片做基本限制：

- 只接受 `png`、`jpg`、`jpeg`、`webp`、`gif`。
- 上传文件名会被改成安全文件名，避免覆盖同名文件和写入异常路径。
- 本地服务也会限制文章 slug，只允许字母、数字、连字符和下划线。

## SEO 和订阅

项目会在构建时生成：

- `/sitemap.xml`：包含首页、博客列表、项目列表、文章详情和项目详情。
- `/robots.txt`：允许抓取公开页面，排除 `/admin/`。
- `/rss.xml`：输出已发布文章的 RSS 订阅，页面底部也提供 RSS 入口。

这些文件的数据来源是 `content/site.ts`、`content/posts/*.md` 和 `content/projects.json`。如果修改站点域名，请同步更新 `content/site.ts` 里的 `url`。

## 构建和部署

本地构建：

```bash
npm run build
```

生产构建会生成静态文件：

```txt
out/
```

GitHub Actions 配置在 `.github/workflows/deploy-pages.yml`。触发条件：

- push 到 `main`
- push 到 `homepage-next`
- 手动运行 workflow

部署流程：

1. Checkout 代码。
2. 使用 Node 22。
3. 执行 `npm ci`。
4. 执行 `npm run build`。
5. 上传 `out/`。
6. 发布到 GitHub Pages。

推送后可以用 GitHub CLI 查看部署状态：

```bash
gh run list --workflow "Deploy to GitHub Pages"
gh run watch
```

也可以直接检查线上页面：

```bash
curl -I https://klaybloom.github.io/
```

刚 push 后如果线上页面暂时 404 或内容没更新，先看 GitHub Actions 是否还在部署。

## 开发注意事项

- 修改内容前先看 `git status`，避免覆盖已有工作。
- 本地后台保存会直接改文件，保存后用 `git diff` 检查。
- 文章 slug 改名本质上是新文件路径，删除旧文章时确认旧文件已移除。
- `content/posts` 下只有 `published !== false` 的文章会进入列表和静态路由。
- Markdown 正文不会渲染原始 HTML；需要复杂排版时，优先用 Markdown 或新增受控组件。
- 静态导出环境不能依赖运行时服务器接口，页面数据应来自文件系统和构建期可读取的数据。
- 图片使用普通静态路径，Next Image 已配置 `unoptimized: true`。
- 如果部署到子路径，可设置 `PAGES_BASE_PATH`，`next.config.mjs` 会同步设置 `basePath` 和 `assetPrefix`。

## 发布前检查

建议每次发布前执行：

```bash
npm run build
git status --short
```

如果改了文章或项目，再重点检查：

- 文章 Front Matter 是否完整。
- 图片路径是否以 `/images/...` 开头。
- `published` 是否符合预期。
- 项目 `slug` 是否唯一。
- 首页区块的 `type` 是否来自 `lib/home-sections.ts`。
- 后台保存文章时会运行发布前检查；如果有 warning，请确认它们符合预期再保存。

## 更多内容维护说明

补充文档在：

- `docs/CONTENT_GUIDE.md`
- `docs/templates/post-template.md`
- `docs/templates/project-template.ts`
