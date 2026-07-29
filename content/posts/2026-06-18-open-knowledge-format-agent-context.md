---
title: "别再把知识库塞进 Prompt 了，Google 新 OKF 给 Agent 开了一扇门"
date: "2026-06-18"
description: "Google Cloud 发布 OKF v0.1，用 Markdown 和 YAML frontmatter 给 AI Agent 提供供应商中立的结构化上下文。这件事对中文创业团队的意义，不是又多了一个格式，而是团队知识终于可以从文档变成可被 Agent 稳定调用的产品资产。"
tags:
  - AI Agent
  - Knowledge Management
  - Product
  - Google Cloud
category: "AI"
cover: "/images/posts/2026-06-18-open-knowledge-format-agent-context/cover.webp"
published: true
featured: false
---
![封面图：Agent 读取结构化知识目录](/images/posts/2026-06-18-open-knowledge-format-agent-context/cover.webp)

过去一年，很多团队做 AI 应用时都遇到过同一个问题：

模型本身越来越强，但公司自己的知识仍然散在飞书、Notion、Confluence、数据库说明、指标口径、客服 SOP、销售话术和工程 runbook 里。

最后大家只能把一堆材料塞进 Prompt，或者临时做一个 RAG。能用，但很容易变成一次性的工程：今天能答，明天文档改了就乱；这个 Agent 能读，换个工具又要重新适配。

6 月 17 日 AIHOT 日报里，Google Cloud 发布的 Open Knowledge Format，也就是 OKF v0.1，值得认真看。它不是一个炫技产品，也不是又一个重型知识库平台。它更像是给 Agent 时代的团队知识定了一个很朴素的交付格式：

> 用一组带 YAML 元数据的 Markdown 文件，把团队知识组织成任何 Agent 都能读、能索引、能迁移的目录。

Google Cloud 官方博客对它的描述很克制：OKF v0.1 把知识表示成一个 Markdown 文件目录，每个文件带少量约定字段，不需要专有服务、SDK 或运行时。文件可以放在 GitHub，可以打成 tarball，也可以挂到任意文件系统里。

这件事真正重要的地方在于：Agent 需要的不是“更多文字”，而是“可被稳定引用的知识单元”。

## 为什么这次不是普通 Markdown

Markdown 当然不新。YAML frontmatter 也不新。很多静态博客、文档站、知识库早就这么做。

但 OKF 的重点不是发明语法，而是把知识文件变成跨工具可消费的对象。

一个最小 OKF 文件，大概可以长这样：

```yaml
---
type: metric
title: 付费转化率
description: 从注册用户到首笔付费订单的比例
owner: growth
freshness: weekly
---

# 付费转化率

定义：首笔付费用户数 / 新注册用户数。

适用场景：增长周报、渠道质量评估、定价实验复盘。

注意：企业试用账号不计入分母。
```

这段文字如果只是放在 wiki 里，它是说明文档。  
如果被 Agent 当成一个有 `type`、`title`、`description`、`owner`、`freshness` 的知识对象，它就可以参与检索、路由、权限、更新提醒和结果解释。

同样是 Markdown，差别在这里。

![正文配图：OKF 如何把零散知识变成 Agent 可读目录](/images/posts/2026-06-18-open-knowledge-format-agent-context/image-01.webp)

## 对创业团队的价值：少一点平台依赖，多一点可迁移资产

很多公司正在把内部工作流接入 Agent：销售自动整理客户背景，运营自动生成活动复盘，研发自动查 runbook，管理层自动问指标。

这些场景的难点往往不在模型，而在知识治理。

| 旧做法 | 常见结果 | OKF 的启发 |
| --- | --- | --- |
| 把文档直接塞进 Prompt | 上下文变长，答案不稳定 | 先把知识拆成可引用单元 |
| 每个 Agent 各做一套 RAG | 重复建设，迁移成本高 | 用统一目录作为共同输入 |
| 知识只给人读 | Agent 只能靠猜字段含义 | 用 frontmatter 明确类型和描述 |
| 绑定某个 SaaS 知识库 | 换平台成本高 | 文件可托管、可打包、可版本管理 |

这对中文团队尤其现实。

很多中小团队不会先花几个月做知识中台。它们更可能先有一堆 Markdown、飞书导出文档、客服 FAQ、销售话术和数据库说明。OKF 的思路提醒我们：不要急着买一个“AI 知识库”，先把现有知识变成清楚、轻量、能跟代码一起管理的文件资产。

如果一套知识能被 Git 管理，就能 review；能 review，就能追溯；能追溯，Agent 的回答才有出处。

## 这和 OpenRouter 的 Subagent 放在一起看，更有意思

同一天的日报里还有一个相关动态：OpenRouter 推出 `openrouter:subagent` server tool，让前沿模型把总结、抽取、格式转换、样板生成这类独立任务交给更便宜、更快的小模型处理。

这两件事放在一起，说明 Agent 应用正在从“一个大模型全包”走向更清晰的分工：

1. 大模型负责规划、判断和最终表达。
2. 小模型负责可隔离的重复任务。
3. 知识目录负责提供稳定上下文。

这也是成本结构的变化。以前我们总说“上下文越长越好”，现在更像是：上下文应该更准，任务应该可拆，知识应该可复用。

如果团队把内部知识整理成 OKF 这样的目录，大模型就不需要每次吞下一整本手册。它可以先找相关知识文件，再让 subagent 做抽取或摘要，最后自己做决策和输出。

这不是概念上的优雅，而是直接影响调用成本、延迟和可维护性。

## 产品人和开发者可以从三个地方试起

别把 OKF 理解成“Google 又出了一个标准，我们要不要跟”。现在更好的动作是把它当成一个整理团队知识的模板。

第一，先挑一个高频知识域。

例如指标定义、客服 SOP、内部 API、销售问答、部署 runbook。不要一开始整理全公司知识。先找一个每天都会被问、回答经常不一致、改动又需要留痕的领域。

第二，给每个知识单元加最少元数据。

建议先从这些字段开始：

```yaml
type: metric | sop | api | policy | faq | runbook
title: 人能看懂的标题
description: 给 Agent 的一句话解释
owner: 负责团队或负责人
updated: 最近更新时间
freshness: daily | weekly | monthly | ad-hoc
```

字段不要多。多了没人维护，格式也会变成负担。

第三，把知识目录接到现有 Agent，而不是重做产品。

如果你已有客服助手、数据问答、研发助手，可以先让它读取这个目录：按 `type` 做筛选，按 `description` 做召回，回答时引用文件标题和更新时间。

到这一步，你会很快看出哪些知识真的有用，哪些只是“看起来应该有”的文档。

![正文配图：团队落地 OKF 的三步清单](/images/posts/2026-06-18-open-knowledge-format-agent-context/image-02.webp)

## 真正的变化：知识开始像代码一样交付

OpenAI 同日发布的 Deployment Simulation 也在讲类似的方向：用更接近真实部署的对话环境，在模型上线前预测行为风险。它说明大模型产品已经不只是“模型能力”问题，而是完整系统的工程问题。

OKF 也是这样。

它看上去只是 Markdown 文件目录，但背后其实是在回答一个问题：当 Agent 进入业务流程以后，组织知识应该以什么形态交付给它？

我的判断是，未来很多团队会形成两套并行资产：

- 代码仓库：交付系统能力。
- 知识仓库：交付业务上下文。

前者给程序运行，后者给 Agent 工作。两者都需要版本、审查、负责人和更新记录。

对创业者来说，这里面有一个很实际的机会：不要只做“套壳聊天框”，也不要只卖“更聪明的模型调用”。真正有壁垒的产品，可能是帮客户把零散业务知识整理成可被 Agent 调用、可迁移、可审计的知识资产。

模型会继续变。供应商也会变。

但一个团队对业务的理解，如果能被清楚地写下来、结构化地维护、稳定地交给不同 Agent 使用，这件事本身就是资产。

OKF v0.1 还很早，未必会成为最终标准。

但它提醒我们：Agent 时代的文档，不应该只是给人看的页面。它也应该是给机器工作的上下文。

参考资料：

- AIHOT 2026-06-17 日报
- Google Cloud: How the Open Knowledge Format can improve data sharing
- OpenRouter: Subagent server tool
- OpenAI: Predicting model behavior before release by simulating deployment
