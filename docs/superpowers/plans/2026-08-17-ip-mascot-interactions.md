# IP Mascot Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将方圆、珍珠、香香分配到不互相遮挡的页面位置，并实现珍珠眼睛跟随与香香鼠标跟随。

**Architecture:** 保留现有 `FangyuanIP` 作为 Hero 内的方圆角色；将全局装饰拆成独立的 `PearlMascot` 和 `XiangXiangFollower` 客户端组件。珍珠使用动物原貌 PNG 加眼睛瞳孔 overlay，香香使用独立的 requestAnimationFrame 鼠标跟随，两个组件都通过 `pointer-events: none` 不干扰页面操作。

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `next/image`, CSS animations, requestAnimationFrame。

## Global Constraints

- 珍珠身体保持静止蹲坐，不添加跳动或奔跑动画。
- 珍珠使用 `珍珠-1动物原貌/珍珠-动物原貌-透明封面角色.png`。
- 香香移除滚动进度条，改为鼠标跟随角色。
- `prefers-reduced-motion: reduce` 下关闭动态跟随。
- 角色必须使用 `pointer-events: none`，不能阻塞内容交互。

---

### Task 1: 更新本地 IP 资源

**Files:**
- Create: `public/images/ip/pearl-animal.png`

**Interfaces:**
- Produces: 浏览器可访问的 `/images/ip/pearl-animal.png` 透明 PNG。

- [ ] **Step 1: 复制动物原貌透明素材并压缩到网页尺寸**

  来源：`/Users/bloom/FangYuan/Project/小红书-方圆说/个人IP/珍珠-1动物原貌/珍珠-动物原貌-透明封面角色.png`。

- [ ] **Step 2: 检查文件格式和透明通道**

  Run: `file public/images/ip/pearl-animal.png`
  Expected: PNG image data with RGBA/alpha channel.

### Task 2: 重做珍珠右下角组件

**Files:**
- Modify: `components/home/PearlMascot.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `/images/ip/pearl-animal.png`。
- Produces: 固定右下角静态身体、两个 `.pearl-eye-pupil` 瞳孔层和鼠标方向状态。

- [ ] **Step 1: 删除身体位移和跳动逻辑**

  保留组件客户端行为，但只计算 `targetX/targetY`，将结果写入 CSS variables `--pupil-x` 和 `--pupil-y`；不修改外层角色 translate。

- [ ] **Step 2: 添加两个眼睛瞳孔 overlay**

  在珍珠透明图上增加左右两个绝对定位的瞳孔元素，位置相对于 1254×1254 原图缩放后的脸部区域，位移限制在约 `±2px` 到 `±3px`。

- [ ] **Step 3: 添加 reduced-motion 规则**

  reduced motion 时把瞳孔位移变量归零，身体保持静止。

### Task 3: 用香香鼠标跟随替换进度条

**Files:**
- Create: `components/home/XiangXiangFollower.tsx`
- Delete: `components/home/XiangXiangProgress.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: 一个小型、非交互、受边界限制的香香鼠标跟随角色。

- [ ] **Step 1: 创建跟随组件**

  使用 `pointermove` 更新目标坐标，用 `requestAnimationFrame` 平滑追踪；位置限制在视口内，并让香香位于鼠标右下方约 20px，避免覆盖指针本身。

- [ ] **Step 2: 替换 layout 中的进度组件**

  移除 `XiangXiangProgress` import/render，改为 `XiangXiangFollower`。

- [ ] **Step 3: 删除进度条 CSS**

  删除 `.xiangxiang-progress`、`.xiangxiang-track`、`.xiangxiang-bird` 和对应 keyframes，加入跟随角色的静态尺寸和 reduced-motion 样式。

### Task 4: 验证布局和交互

**Files:**
- Test: local browser preview

- [ ] **Step 1: 运行 lint**

  Run: `npm run lint`
  Expected: exit code 0。

- [ ] **Step 2: 运行 production build**

  Run: `npm run build`
  Expected: Next.js build completes and all static routes generate。

- [ ] **Step 3: 截图检查首页**

  检查 Hero 只显示方圆，右下角珍珠完整可见，香香跟随角色不占据顶部进度条位置，页面无 Next.js 标志。
