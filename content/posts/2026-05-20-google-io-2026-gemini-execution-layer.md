---
title: "Google I/O 2026：Gemini 正在从聊天框变成执行层"
date: "2026-05-20"
description: "昨晚的 Google I/O 2026，看完之后最明显的感受是：Google 不想再把 Gemini 讲成一个聊天机器人。"
tags:
  - AI
  - 公众号
category: "AI"
cover: "/images/posts/2026-05-20-google-io-2026-gemini-execution-layer/cover.png"
published: true
featured: false
---

![封面图](/images/posts/2026-05-20-google-io-2026-gemini-execution-layer/cover.png)

昨晚的 Google I/O 2026，看完之后最明显的感受是：Google 不想再把 Gemini 讲成一个聊天机器人。

它要讲的是另一件事：你在 Search 里问问题，在 Chrome 里浏览网页，在 Workspace 里处理邮件和文档，在 Android 上用手机，在开发工具里写应用，这些场景都可以接上同一类 AI 代理。Gemini 不只是回答一句话，而是理解上下文、调用工具、保留任务状态，并在你授权后继续处理后续步骤。

这也是今年大会最值得开发者关注的地方。

## 不是模型发布会，而是代理系统发布会

Google 发布了 `Gemini 3.5`，首发版本是 `Gemini 3.5 Flash`。Google 给它的定位很直接：面向代理任务和代码任务。它已经进入 Gemini App、Search 的 AI Mode、Gemini API、Google AI Studio、Android Studio、Google Antigravity 和 Gemini Enterprise。

`Gemini 3.5 Pro` 还没有正式开放，Google 说会在下个月推出。

这次模型升级的重点不只是更聪明，而是更适合长任务。比如读一批文档、维护一段代码、处理一个企业流程、管理多个子任务。换句话说，Google 想让模型从“问答能力”变成“工作能力”。

![Google I/O 2026 的核心结构](/images/posts/2026-05-20-google-io-2026-gemini-execution-layer/image-01.png)

另一个大模型是 `Gemini Omni`。它是新的多模态生成模型，第一步从视频开始。你可以把文字、图片、音频、视频混合作为输入，然后生成或编辑视频。Google 说它会先进入 Gemini App、Google Flow 和 YouTube Shorts，开发者 API 会在未来几周开放。

这对内容生产者很重要，但对开发者来说，更值得盯的是下面这条工具线。

## Antigravity 是今年的开发者主角

今年开发者 Keynote 的中心不是 Android，也不是 Cloud，而是 `Google Antigravity`。

Google 发布了 `Antigravity 2.0`，这是一个独立桌面应用，用来管理多个 AI 代理。你可以让不同代理并行处理任务，也可以安排后台任务。它更像一个面向 AI 代理的开发工作台，而不是传统 IDE 里加一个聊天窗口。

同时发布的还有 `Antigravity CLI` 和 `Antigravity SDK`。

CLI 面向喜欢终端的开发者。SDK 则更关键，它允许开发者把同一套代理能力放进自己的基础设施里。再加上 Gemini API 里的 `Managed Agents`，Google 已经把“创建一个带隔离 Linux 环境、能使用工具、能执行代码、能保留状态的代理”做成了 API 能力。

这会改变很多应用的形态。以前你做 AI 功能，通常是向模型发请求，然后自己处理工具调用、文件状态、执行环境和权限。现在 Google 想把这些通用部分托管起来，让开发者更快做出可执行任务的应用。

![开发工具链变化](/images/posts/2026-05-20-google-io-2026-gemini-execution-layer/image-02.png)

## Search、Chrome、Workspace 都在变成入口

Search 的变化也很大。Google 说 AI Mode 月活已经超过 10 亿，并把 `Gemini 3.5 Flash` 作为 AI Mode 的默认模型。

新的搜索框不再只是关键词入口。它支持文字、图片、文件、视频、Chrome 标签页等输入，还能继续追问。更重要的是，Search 里会出现信息代理：你可以让它持续关注某个问题，等有变化时给你整理更新。

Chrome 这边，Google 提出了 `WebMCP`。这是一个拟议中的开放 Web 标准，允许网站把 JavaScript 函数、HTML 表单等结构化能力暴露给浏览器里的 AI 代理。对用户来说，代理不必像人一样慢慢点击网页；对网站来说，可以给代理更清晰、更安全的调用入口。

Chrome 还会提供面向代理的 DevTools 能力，让代理读取控制台、网络请求、可访问性树等信息，用于调试、检查性能和修复问题。

Workspace 也在往同一个方向走。Gmail、Docs、Keep 会增加语音交互，`Google Pics` 用于生成和编辑图片，`Gemini Spark` 则被定义成 24/7 的个人 AI 代理，可以在用户指令下接入 Workspace 处理任务。

## Android XR 说明 Google 还想抢下一代入口

大会上最容易出圈的是智能眼镜。

Google 宣布 Android XR 智能眼镜今年秋季推出，合作方包括 Samsung、Gentle Monster 和 Warby Parker。眼镜分为音频眼镜和带显示的眼镜，先推出音频眼镜。功能包括看见即问、导航、消息、拍照、翻译、调用手机 App，并且同时支持 Android 和 iOS。

这部分不只是硬件新闻。它说明 Google 认为 Gemini 的入口不该停留在手机屏幕里。搜索框、浏览器、办公软件、手机系统、眼镜，都会成为同一个 AI 层的入口。

## 对开发者意味着什么

这场 I/O 的信息很多，但可以抓住三件事。

第一，代理会成为 Google AI 产品的默认方向。以后开发 AI 应用，不能只考虑一次性问答，还要考虑任务状态、工具权限、文件环境、用户授权和失败处理。

第二，Web 要为代理重新设计。`WebMCP` 如果推进顺利，网站不只服务人类用户，也要服务浏览器里的 AI 代理。表单、账号、支付、预订、查询，都可能需要新的接口设计。

第三，开发工具正在被重写。Antigravity、AI Studio、Managed Agents API、Chrome DevTools for agents，本质上都在把“AI 帮你写代码”推进到“AI 帮你完成一段工程任务”。

当然，这里面也有需要谨慎看的地方。很多能力还在灰度、预览或订阅限制中；企业真正使用时，还要验证权限、审计、数据边界和成本。Google 的演示很完整，但落到团队工作流里，还需要实际测试。

不过方向已经很清楚：Google 不再把 AI 当成一个独立 App，而是在重建一层执行系统。对创业者和开发者来说，下一步不是问“哪个模型更强”，而是问：我的产品里，哪些任务可以交给可靠的代理完成？

参考资料：

- [Google I/O 2026 官方汇总](https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-collection/)
- [Google I/O 2026 Developer Keynote 汇总](https://developers.googleblog.com/en/all-the-news-from-the-google-io-2026-developer-keynote/)
- [Gemini 3.5 官方介绍](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/)
- [Gemini Omni 官方介绍](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni/)
- [Google AI Studio I/O 2026 更新](https://blog.google/innovation-and-ai/technology/developers-tools/google-ai-studio-io-2026/)
- [Google Search I/O 2026 更新](https://blog.google/products-and-platforms/products/search/search-io-2026/)
- [Chrome at I/O 2026](https://developer.chrome.com/blog/chrome-at-io26?hl=en)
