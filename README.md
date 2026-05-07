# klay 个人主站

统一的个人技术主页、博客和项目作品集。站点以 `klaybloom.github.io` 为唯一入口，使用静态配置和 Markdown 管理内容，适配 GitHub Pages 静态导出。

## 在线访问

- GitHub Pages: <https://klaybloom.github.io/>
- 源码仓库: <https://github.com/klaybloom/klaybloom.github.io>

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Markdown + Front Matter
- GitHub Pages
- GitHub Actions

## 本地开发

```bash
npm install
npm run dev
```

默认本地地址：

```txt
http://localhost:3000
```

## 构建

```bash
npm run lint
npm run build
```

项目使用 Next.js 静态导出，构建产物位于 `out/`。

## 内容维护

### 修改个人信息

个人简介在 `content/profile.ts`：

- `name`：中文姓名
- `nickname`：首页主标题
- `title`：职业标题
- `summary`：首页摘要
- `bio`：简介段落
- `links`：GitHub、博客、项目、邮箱链接

站点标题和导航在 `content/site.ts`。

### 修改技能栈

技能分组在 `content/skills.ts`，每组包含：

- `group`：分组名称
- `items`：技能列表

### 修改经历

经历在 `content/experience.ts`，每条包含：

- `period`
- `title`
- `company`
- `description`

### 添加项目

项目数据在 `content/projects.ts`。新增项目时添加一个对象：

```ts
{
  title: "Project Name",
  slug: "project-name",
  description: "一句话简介。",
  longDescription: "更完整的项目说明。",
  stack: ["Next.js", "TypeScript"],
  category: "Personal Site",
  cover: "/images/projects/project-name.png",
  github: "https://github.com/klaybloom/project-name",
  demo: "https://example.com",
  date: "2026-05-07",
  updated: "2026-05-08",
  status: "building",
  featured: true,
  pinned: true
}
```

项目图片放在 `public/images/projects/`，路径统一写成 `/images/projects/...`。

### 添加博客文章

文章放在 `content/posts/`，文件名会成为文章 URL：

```txt
content/posts/2026-05-07-my-post.md
/blog/2026-05-07-my-post/
```

Front Matter 示例：

```md
---
title: "Nacos 配置不生效的排查思路"
date: "2026-05-07"
updated: "2026-05-08"
description: "从配置文件、客户端缓存、服务注册元数据几个角度分析 Nacos 配置不生效问题。"
tags:
  - Nacos
  - Spring Cloud
  - 微服务
category: "后端开发"
cover: "/images/posts/nacos-config.jpg"
published: true
featured: true
---

正文内容...
```

字段说明：

- `title`：必填，文章标题
- `date`：必填，发布日期
- `updated`：选填，更新日期
- `description`：选填，摘要
- `tags`：选填，标签
- `category`：选填，分类
- `cover`：选填，封面图
- `published`：选填，设置为 `false` 时不展示
- `featured`：选填，预留精选标记

博客图片放在 `public/images/posts/`，路径统一写成 `/images/posts/...`。

封面优先级：

1. Front Matter `cover`
2. 正文第一张图片
3. `/images/default-cover.jpg`

## 页面结构

```txt
app/
  page.tsx
  blog/
    page.tsx
    [slug]/page.tsx
  projects/
    page.tsx
    [slug]/page.tsx
components/
content/
lib/
public/images/
```

## 部署

项目已配置 GitHub Actions。推送到 `main` 后，workflow 会运行：

```bash
npm ci
npm run build
```

然后把 `out/` 发布到 GitHub Pages。
