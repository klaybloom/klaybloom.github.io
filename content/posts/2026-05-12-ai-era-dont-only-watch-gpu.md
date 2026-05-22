---
title: "AI 时代，别只盯着 GPU"
date: "2026-05-12"
description: "英伟达一代代机柜往上堆，云厂商一季一季加预算，大家自然会先盯着 GPU。但如果你只看 GPU，很容易漏掉更大的变化。"
tags:
  - AI
  - 公众号
category: "AI"
cover: "/images/posts/2026-05-12-ai-era-dont-only-watch-gpu/cover.png"
published: true
featured: false
---

![封面图](/images/posts/2026-05-12-ai-era-dont-only-watch-gpu/cover.png)

最近这轮 AI 基建热，最显眼的是算力。

英伟达一代代机柜往上堆，云厂商一季一季加预算，大家自然会先盯着 GPU。但如果你只看 GPU，很容易漏掉更大的变化。

AI 时代涨价的不是一个零件，而是一整条基础设施链。

根据 IDC 的数据，2025 年全球 AI 基础设施支出达到 3180 亿美元，2026 年预计到 4870 亿美元，2029 年有望超过 1 万亿美元。Gartner 也预计，2026 年数据中心系统支出会增长 55.8%。

这不是普通服务器升级，这是一次基础设施重新定价。

## 先看清楚，钱都花到哪里了

这轮 AI 基建有三个明显特征。

第一，算力更集中。

NVIDIA GB200 NVL72 已经不是单卡概念，而是 72 张 Blackwell GPU 组成的液冷机柜。到 Vera Rubin NVL72，NVIDIA 给出的方向更明确，机柜级系统会继续围绕更大显存、更高速互连、更低推理成本演进。

![AI 基础设施链路图](/images/posts/2026-05-12-ai-era-dont-only-watch-gpu/image-01.png)

第二，电力成为硬约束。

IEA 预计，全球数据中心用电量到 2030 年会接近翻倍，达到约 945 TWh，占全球总用电量接近 3%。更麻烦的是，数据中心不是均匀分布，它们会集中压到少数电网节点上。

这意味着，未来 AI 能不能扩，不只取决于有没有 GPU，也取决于有没有电、有没有变压器、有没有冷却系统、有没有地方接入电网。

第三，存储和内存开始进入主舞台。

Omdia 在 2026 年 4 月把半导体收入增长预测上调到 62.7%，原因之一就是 DRAM 和 NAND 的持续紧缺。它还提到，HBM 产能优先级上升，会挤压传统内存供应。Samsung 也预计 2026 年 HBM 销售额会比 2025 年增长三倍以上。

AI 以前像是在吃算力，现在更像是在吃数据、吃内存、吃带宽。

## 存储为什么突然变重要

过去很多人把存储理解成硬盘容量，便宜、后台、没存在感。

到了 AI 时代，这个理解不够用了。

训练需要数据集，微调需要版本管理，RAG 需要向量库和原始文档，Agent 需要长期记忆，多模态需要图片、视频、音频一起进入数据管道。推理阶段也不是无状态服务，长上下文和 KV cache 会持续推高内存与高速存储压力。

IDC 的 Global DataSphere 预测经 Statista 汇总后显示，全球数据规模到 2028 年会达到约 394 ZB。数据不一定全部长期保存，但企业真正头疼的是，哪些数据值得留，留在哪里，怎么被模型安全地调用。

![数据进入模型的路径](/images/posts/2026-05-12-ai-era-dont-only-watch-gpu/image-02.png)

这也是为什么我会把存储分成三层看。

第一层是高性能存储，服务训练和推理，重点是吞吐、延迟和并发。

第二层是数据湖和对象存储，服务企业数据资产，重点是成本、治理和生命周期。

第三层是边缘和本地存储，服务端侧 AI、私有部署和低延迟场景。

真正值得关注的不是硬盘便宜还是贵，而是谁能把数据变成可被模型持续使用的生产资料。

## 接下来还有哪些值得关注

第一，看电力和冷却。

液冷、配电、UPS、变压器、园区电网，会从后台设施变成 AI 竞争的一部分。模型公司会继续讲智能，但基础设施公司会开始讲每瓦能产出多少 token。

第二，看网络。

GPU 之间的数据搬运越来越重要。NVLink、InfiniBand、以太网交换芯片、光模块，都会跟着 AI 集群规模一起变贵。大模型不是一张卡在算，是成千上万张卡在同步。

第三，看内存。

HBM 是训练和推理的核心资源，DRAM、NAND 也会被 AI 数据中心带着涨。消费电子、PC、手机感受到的内存涨价，背后其实也是 AI 数据中心先吃掉了高价值产能。

第四，看数据治理。

企业上 AI 后，很快会发现不是缺模型，而是数据散、权限乱、历史文档没人管。谁能把数据清洗、标注、检索、权限、审计做成可靠系统，谁就有机会拿到下一轮预算。

第五，看推理成本。

训练很贵，但推理才是长期账单。Agent、视频生成、实时语音、多轮任务都会把推理量放大。以后评估一个模型，不只看跑分，还要看单位任务成本、延迟和稳定性。

## 这轮机会不只属于芯片

AI 基建会继续扩张，但关注点要从单一 GPU 转向整套系统。

算力决定模型能不能跑起来。

存储决定数据能不能被用起来。

电力和冷却决定机柜能不能摆下去。

网络决定集群能不能协同。

治理和软件决定企业能不能把 AI 用进业务。

所以，AI 时代真正值得关注的，不是某一个环节疯涨，而是整个基础设施栈正在重新排序。

谁解决瓶颈，谁就会被市场看见。

## 资料参考

- [IEA Energy and AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)
- [IDC AI Infrastructure Spending](https://www.idc.com/resource-center/blog/ai-infrastructure-spending-caps-historic-year-at-90-billion-in-q4-2025-2029-spending-to-eclipse-1-trillion/)
- [Gartner IT Spending Forecast 2026](https://www.gartner.com/en/newsroom/press-releases/2026-04-22-gartner-forecasts-worldwide-it-spending-to-grow-13-point-5-percent-in-2026-totaling-6-point-31-trillion-dollars)
- [Omdia Semiconductor Forecast 2026](https://omdia.tech.informa.com/pr/2026/apr/omdia-raises-2026-semiconductor-forecast-to-62point7percent-as-ai-drives-global-memory-crunch)
- [NVIDIA GB200 NVL72](https://www.nvidia.com/en-sg/data-center/gb200-nvl72/)
- [Samsung HBM4](https://news.samsung.com/global/samsung-ships-industry-first-commercial-hbm4-with-ultimate-performance-for-ai-computing)
- [NVIDIA Vera Rubin NVL72](https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/)
- [Statista Global Data Volume Forecast](https://de.statista.com/statistik/daten/studie/267974/umfrage/prognose-zum-weltweit-generierten-datenvolumen/)
