---
title: "MCP 开始进生产环境：AI 应用要重做工具层"
date: "2026-05-29"
description: "Runway MCP 和 OpenAI 私有 MCP 隧道同一天进入视野，说明 MCP 正从开发者配置项变成 AI 产品的基础设施。"
tags:
  - AI Agent
  - MCP
  - AI 产品
  - 开发者工具
category: "AI"
cover: "/images/posts/2026-05-29-mcp-production-tool-layer/cover.webp"
published: true
featured: false
---

![封面图](/images/posts/2026-05-29-mcp-production-tool-layer/cover.webp)

这两天有一个变化，表面看是两条产品新闻，放在一起看，其实是在提醒 AI 应用团队：工具层要重新设计了。

一条来自 Runway。它推出了 Runway MCP，用户可以在 Claude、ChatGPT、Cursor、Replit 等支持 MCP 的环境里，直接调用 Runway 的图像和视频模型。Runway 官方页面写到，连接后可以使用 Gen-4.5、Seedance 2.0、GPT Image 2、Kling、Nano Banana Pro、Veo 等模型，费用走 Runway 账户积分。

另一条来自 OpenAI。OpenAI 文档里新增了 Secure MCP Tunnel：如果 MCP server 在内网、本机或防火墙后面，可以通过隧道接入 ChatGPT、Codex 和 Responses API，不需要把服务暴露到公网。

这不是“又多了几个工具”。这是一个更大的信号：MCP 正从个人配置文件里的插件，变成 AI 产品连接内部系统、外部服务和专业能力的标准入口。

## 为什么这件事值得产品团队认真看

过去一年，很多团队做 AI 产品时，默认思路是：先做聊天框，再加几个 function call，最后接一点数据库或业务 API。

这个做法能做 demo，但进到真实业务会遇到三个问题。

**第一，工具太分散。**  
同一个订单查询、图片生成、CRM 写入，可能在 ChatGPT、内部 Agent、客服系统、运营工具里各写一遍。

**第二，权限不清楚。**  
AI 一旦可以读内部知识库、写业务系统、调用第三方服务，团队必须回答：哪些工具能读，哪些工具能写，谁批准，调用记录在哪里。

**第三，专业能力越来越贵。**  
视频、图片、代码、搜索、企业数据都不是“模型自己会一点就够”。真正可用的能力，往往来自专门系统。AI 应用要能快速接入这些能力，还要管住成本和风险。

MCP 的价值就在这里：它把“模型怎么调用外部能力”变成一个相对统一的协议。产品团队不必为每个模型、每个客户端、每个业务入口重复设计一套工具接入方式。

![正文配图：工具层架构](/images/posts/2026-05-29-mcp-production-tool-layer/image-01.webp)

## Runway MCP 说明了什么

Runway 的例子很直观。

以前你想让 AI 帮你做一条产品视频，流程通常是这样的：在聊天工具里写创意，复制到视频工具，反复调参数，再把结果拿回文档或网页里。

Runway MCP 让这个流程变成：在当前 Agent 里描述目标，Agent 通过 Runway MCP 调用模型，生成结果保存到 Runway library。它面向的不是“开发者写 API”，而是“创意工作流就在 Agent 里完成”。

这对中文团队有两个启发。

第一，AI 产品不一定要把所有能力都做在自己平台里。把专业工具接成 MCP，可能比重做一个视频生成页面更快，也更容易跟用户现有工作流融合。

第二，MCP server 本身会变成产品分发入口。过去 SaaS 拼的是网页、插件、API、Zapier；接下来还会拼“能不能被主流 Agent 顺畅调用”。

## OpenAI 私有 MCP 隧道说明了什么

Runway 代表外部专业工具。OpenAI 的 Secure MCP Tunnel 代表企业内部系统。

OpenAI 文档明确说，远程 MCP server 可以给模型新的能力；如果 MCP server 是私有的、在本地或防火墙后面，可以用 Secure MCP Tunnel 连接到支持的 OpenAI 产品，而不用把 server 放到公网。

这个点很关键。很多公司不是不想把 AI 接进内部系统，而是不敢。

因为内部系统里有客户数据、财务数据、代码仓库、工单、权限体系。把这些系统直接放到公网，再让模型调用，安全团队很难接受。隧道模式至少给了一个更现实的路径：服务还在内部，连接走出站 HTTPS，工具调用由平台侧发起和记录。

但这不等于可以放心大胆全开。OpenAI 的 MCP 文档也提醒，远程 MCP server 会带来提示注入、第三方服务数据流向、工具行为变化等风险；敏感操作应该要求批准，并记录发送给 MCP server 的数据。

> MCP 不是“让 AI 什么都能干”的按钮。它更像一层工具权限系统，设计不好，风险会比普通 API 集成更大。

## 创业团队现在该怎么做

如果你正在做 AI 应用，不建议马上追着每个热门 MCP server 接一遍。更好的顺序是先画清楚自己的工具地图。

| 问题 | 产品团队要回答 |
| --- | --- |
| 用户最常让 AI 做什么动作 | 只是查询，还是会写入业务系统 |
| 工具数据来自哪里 | 内部数据库、第三方 SaaS、文件系统，还是创意模型 |
| 哪些动作需要人工批准 | 付款、发消息、改客户资料、提交代码 |
| 调用记录给谁看 | 用户、管理员、安全团队、客服 |
| MCP server 谁来维护 | 自研、官方服务商，还是第三方聚合服务 |

可以从三个场景开始试。

1. **内部只读查询**：比如知识库、订单、项目状态。先只开放读接口，观察用户怎么问、工具怎么被调用。
2. **低风险写操作**：比如创建草稿、生成素材、提交待审核内容。让 AI 先写到待确认区，不直接改变核心数据。
3. **专业能力调用**：比如视频生成、图片生成、搜索、代码检查。优先选择官方 MCP server，少接来源不明的中间层。

配置上可以先用很直白的规则：

```txt
read: 自动允许
draft: 允许生成，但需要用户确认
write: 默认需要批准
admin: 不给 Agent
```

这不是完整安全方案，但足够让团队从“能不能接”进入“怎么可控地接”。

![正文配图：落地清单](/images/posts/2026-05-29-mcp-production-tool-layer/image-02.webp)

## 真正的竞争点会变成工具体验

模型能力还会继续上升，但产品差异不会只来自“用了哪个模型”。

未来很多 AI 产品的竞争点会变成：它能不能拿到正确上下文，能不能调用合适工具，能不能在用户已有流程里完成动作，并且让管理员看得见、管得住。

Runway MCP 把创意模型放进 Agent 流程。OpenAI 私有 MCP 隧道把内部系统接入问题往前推了一步。两件事合在一起看，MCP 已经不是开发者社区里的配置热闹，而是在进入真实产品架构。

对创业团队来说，现在值得做的不是喊“全面 MCP 化”，而是选一个高频、低风险、可衡量的工作流，认真做一次工具层改造。

能让 AI 调工具不难。难的是让它在正确的边界里，替用户完成真正有价值的动作。

资料来源：AIHOT 2026-05-28 日报；[Runway MCP 官方页面](https://runwayml.com/mcp)；[Runway MCP 发布说明](https://runwayml.com/news/mcp)；[OpenAI ChatGPT MCP apps Help Center](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt)；[OpenAI tunnel-client](https://github.com/openai/tunnel-client)。
