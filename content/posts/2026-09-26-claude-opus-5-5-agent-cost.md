---
title: "Claude Opus 5.5 每 token 便宜 20%，Agent 任务账单为何还会变贵？"
date: "2026-09-26"
description: "Anthropic 下调 Claude Opus 5.5 的 token 价格，但编码 Agent 的真实成本还取决于输出、思考强度、缓存和重试。给开发团队一套可复测的选型方法。"
tags:
  - Claude Opus 5.5
  - AI Agent
  - API 成本
  - Claude Code
category: "AI 与产品"
published: true
featured: false
---

Anthropic 在 9 月 22 日发布 Claude Opus 5.5，把 API 输入和输出价格从每百万 token 5 美元/25 美元降到 4 美元/20 美元，缓存读取从 0.50 美元降到 0.20 美元。按单价看，输入和输出便宜了 20%，缓存读取便宜了 60%。

但对写代码的团队来说，模型调用的单价不等于“完成一个任务”的价格。Artificial Analysis 的 Coding Agent Index 显示，在 Claude Code 的 max effort 配置下，Opus 5.5 得分 66，高于 Opus 5 的 60；同一评测给出的单任务成本约为 13.04 美元，对比 Opus 5 的 10.79 美元，反而高约 21%。

这不是自相矛盾，而是两种不同口径：前者比较每个 token 的价格，后者统计特定模型、Agent、effort 和任务集跑完后的总消耗。准备升级 Claude Code、API Agent 或团队模型路由的产品和研发负责人，现在最该做的不是直接替换默认模型，而是拿自己的任务测“每个通过验收的结果要多少钱”。

## 单价下降，为什么任务成本可能上升

Anthropic 的 API 标价确实下降了：Opus 5.5 输入为每百万 token 4 美元、输出 20 美元；缓存读取为 0.20 美元。Anthropic 还指出，Opus 5.5 的思考始终开启，模型在不同任务上可能消耗更多 token，所以任务价格最终取决于工作形态。

一个 Agent 任务会经历多轮“读上下文—调用工具—看结果—继续处理”。每轮都要重发一部分历史上下文；产生的思考与回答算输出 token；如果一次没完成，还会有额外重试。于是，价格降低 20%，并不代表任务成本必然降低 20%。如果模型多思考、多读上下文或多跑几轮，总 token 数增加就可能抵消单价折扣。

Artificial Analysis 的 Coding Agent Index 也不是纯模型裸测。它把模型放在 Claude Code 里，以 max effort 执行一组编码任务，再报告能力与任务成本。这个结果适合回答“这套模型加 Agent 配置在该评测上表现如何”，不能直接当成每家公司的生产账单。

## 两组数字回答的是不同问题

| 口径 | Opus 5.5 的变化 | 能说明什么 |
| --- | --- | --- |
| API token 标价 | 输入/输出比 Opus 5 低 20%，缓存读取低 60% | 同等 token 用量下，单价更低 |
| Coding Agent Index | 得分 66；max effort 单任务约 $13.04，Opus 5 约 $10.79 | 在该 Agent、配置和评测任务上，能力更高但任务用量更大 |
| 团队生产成本 | 尚无你的代码库、任务分布和验收数据 | 需要自行复测，不能由公开榜单代替 |

需要特别谨慎的是，Artificial Analysis 的评测使用 max effort。团队日常可能用 medium 或 high，也可能使用不同模型、工具、上下文策略和缓存状态。拿 $13.04 直接预算你的线上功能，或据此判断所有 Opus 5.5 任务都涨价，都会把评测条件误当成通用结论。

还要区分“每个任务成本”和“每个合格结果成本”。评测里的任务通常有统一题目和自动评分流程；生产工作却可能因为仓库规模、测试耗时、权限限制和需求描述质量而差别很大。一个模型如果花费更多、但减少人工接手和失败重跑，单位合格结果可能更低；相反，只看榜单分数或一次成功案例，也可能漏掉长尾失败。

缓存也不能被简化成一个折扣数字。只有重复发送且匹配缓存的上下文，才按缓存读取价格计费；首次写入缓存、缓存过期、切换设置或切换模型，都可能改变下一轮成本。Anthropic 的示例提醒，长会话每轮会重发已有上下文，因此轮数和缓存命中率会共同影响输入账单。团队复测时应保留真实的会话长度和日常操作习惯，而不是刻意把提示缩短到与生产无关。

Anthropic 自己也建议用真实任务验证。其示例指出，任务成本受轮数、缓存读取、输出 token 和模型选择共同影响；输入与缓存占比不同，降价幅度也不同。比如长会话中缓存读取占比高，缓存折扣更重要；需要大量思考输出的任务，则更受输出 token 价格和思考量影响。

## 开发团队可以怎样复测

先从已有积压任务中选一批常见工作，不要用只有一句话的玩具题。至少覆盖三类：小范围修复、跨文件功能、需要多轮调试的真实问题。给 Opus 5 和 Opus 5.5 相同的仓库状态、任务说明、工具权限和验收步骤，避免把环境差异误认为模型差异。

接着固定 Agent 配置，先测当前默认 effort，再单独比较 medium、high 或 max。不要同时换模型、prompt、缓存策略和工具配置，否则即使结果变好，也无法知道是哪项变化带来的。每个任务记录总费用、输入与输出 token、缓存读取量、轮数、重试次数、耗时，以及最终是否通过同一套测试和人工验收。

样本不必很大，但要能覆盖团队最常遇到的工作，并事先约定失败如何计入。建议先挑 6—10 个历史任务：既包含简单改名，也包含需要定位和测试的缺陷，以及涉及多个文件的功能。把每个任务在两套配置下各跑一次；如果结果接近，再挑关键任务重复跑几轮，观察波动。这样既不会把一次偶然成功当作结论，也能让试验成本保持可控。

最后把结果按“通过验收的任务”计算，而不是只看单次请求价格：

> 每个合格结果成本 = 该批任务总调用成本 ÷ 通过验收的任务数

如果 Opus 5.5 单个成功任务更贵，但显著减少返工或完成更多困难任务，它仍可能划算；如果榜单分数更高，却没有改善你团队的通过率和交付时间，就不必为峰值配置付费。还要单独看 p50 与 p90 成本，避免少数超长会话把平均值掩盖或拉高。

## 选型结论：比较完成质量，不比较价目表

Claude Opus 5.5 的公开变化很明确：token 单价下降，Coding Agent Index 得分领先该榜单，max effort 下的单任务成本也高于 Opus 5。它并没有给所有团队一个统一的“更省”或“更贵”答案。

对产品和研发团队，值得立即做的是一周内的小规模 A/B：选真实任务，固定验收，分别跑当前配置和 Opus 5.5 的目标 effort，再按通过结果核算费用、耗时和返工。日常机械工作可先试较低 effort；复杂任务则判断更高 effort 带来的成功率提升，是否覆盖额外 token 成本。

**看模型价格，也要看每个合格交付的成本。** 方圆Talk会继续跟踪模型发布、价格和 Agent 工具变化，并把公开基准拆成团队能复测的决策问题。

## 参考资料

1. Anthropic，《Claude Opus 5.5: Coding sessions are longer and use more context》，2026-09-24：<https://claude.com/blog/claude-opus-5-5-built-for-coding-sessions-that-use-more-context>
2. Anthropic，《What a task costs on Opus 5.5》，2026-09-22：<https://claude.com/blog/what-a-task-costs-on-opus-5-5>
3. Artificial Analysis，《Claude Opus 5.5 takes the top spot on the Artificial Analysis Intelligence Index》，2026-09-22：<https://artificialanalysis.ai/articles/claude-opus-5-5>
4. Artificial Analysis Coding Agent Index：<https://artificialanalysis.ai/agents/coding-agents>
