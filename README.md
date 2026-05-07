# klay 个人主站

Notion 风格的一页纸个人主站，用于展示 klay 的技术名片、技能栈、精选项目、技术文章、经历摘要和联系方式。

## 在线访问

- GitHub Pages: <https://klaybloom.github.io/>
- 源码仓库: <https://github.com/klaybloom/klaybloom.github.io>

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
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

## 生产构建

```bash
npm run build
```

项目使用 Next.js 静态导出，构建产物位于 `out/`。

## 部署说明

项目已配置 GitHub Actions 自动部署：

- 推送到 `klaybloom/klaybloom.github.io` 的 `main` 分支时，会部署用户主页根路径。

当前推荐访问地址是：

```txt
https://klaybloom.github.io/
```

## 项目结构

```txt
app/
  globals.css
  layout.tsx
  page.tsx
.github/workflows/
  deploy-pages.yml
next.config.mjs
tailwind.config.ts
```

页面主体内容集中在 `app/page.tsx`，全局样式在 `app/globals.css`。
