# V3 Agent Identity and Language System

## Identity palette

Agent identity colors identify ownership. They never change with runtime state.
The five colors share a close perceptual-lightness band, so no member appears
artificially more important simply because their hue is brighter.

| Agent | Organization | Token | OKLCH | Hex |
| --- | --- | --- | --- | --- |
| 巴菲特 | 价值发掘部 · 实习生 · P2 | `--agent-buffett` | `oklch(80% .14 125)` | `#A9CD63` |
| 达利欧 | 宏观推演部 · 部长 · P8 | `--agent-dalio` | `oklch(78% .11 185)` | `#55CEC0` |
| 利弗莫尔 | 动量捕捉部 · 组长 · P7 | `--agent-livermore` | `oklch(81% .13 95)` | `#DBC054` |
| 西蒙斯 | 量化部 · 部长 · P8 | `--agent-simons` | `oklch(76% .12 250)` | `#73B6FA` |
| 塔勒布 | 风险否决部 · 值班主任 · P8 | `--agent-taleb` | `oklch(76% .13 25)` | `#F98F87` |

System semantics stay independent:

- Acid: action, live, primary CTA
- Cyan: data and synchronization
- Ember: execution, waiting, caution
- Rose: risk, loss, blocked
- Steel: idle, complete, historical

Identity color appears only on the Agent signature square, name, task ownership,
collaboration route and attribution charts. State color appears on state words,
alerts and actions. A full card is never filled with an Agent color.

Every colored identity is repeated in text through the Agent name and
organization line; color is not the only identification channel.

## UI copy hierarchy

1. Identity: name + department + position + grade.
2. Human status: one short, personality-aware sentence.
3. Actual work: one precise current-task sentence.
4. Task card: verb + object, Skill, factor, owner and deliverable.
5. Activity event: time + sender → receiver + observable action + result.
6. Decision record: action, evidence, confidence and portfolio effect.

Raw chain-of-thought is never presented. The interface shows observable calls,
reports, collaboration and decisions.

### Staff-card examples

| Agent | Human status | Actual work | Skill |
| --- | --- | --- | --- |
| 巴菲特 | 咖啡还热，价格先凉了 | 复核核心资产现金流压力 | Cashflow Stress |
| 达利欧 | 世界机器今天有点卡 | 扫描美元流动性与政策路径 | Liquidity Regime |
| 利弗莫尔 | 手离回车键还有三厘米 | 等待成交量确认 | Breakout Filter |
| 西蒙斯 | 模型不同意，正在举证 | 回测 17 个相似危机窗口 | Regime Match |
| 塔勒布 | 今天先别当英雄 | 压缩尾部风险预算 | Convexity Guard |

## Workflow vocabulary

1. 市场输入
2. 研判中
3. 交叉复核
4. 执行与监控

Task states:

`待处理 → 分析中 → 协作中 → 待复核 → 执行中 → 已交付`

Exception states:

`存在异议 / 已阻塞 / 已否决 / 数据不足`

Task titles use `verb + object`:

- 判断流动性断点
- 回测相关性突变
- 复核下跌动量
- 筛选高质量资产
- 下调组合风险预算
- 制定分批建仓计划

Task detail order:

1. Owner
2. Skill
3. Factor
4. Deliverable
5. Next hand-off

## Collaboration grammar

An activity entry uses:

`time + sender → receiver + observable action + result`

Approved collaboration verbs:

- 调用 Skill
- 扫描数据
- 交付报告
- 请求复核
- 提出异议
- 更新假设
- 修改风险预算
- 授权执行
- 否决执行
- 进入观察
- 完成归档

Example:

```text
09:42  达利欧 → 西蒙斯
交付流动性情景
危机窗口相似度：0.71
```

## Team decision order

`宏观定环境 → 量化做验证 → 动量定时机 → 价值选标的 → 风险做放行`

Team Core records the resulting action, evidence, confidence and portfolio
effect. `Thinking...` is reserved for the short aggregation interval inside
Team Core; individual Agents use explicit task states.

## Panel names

| 中文 | English |
| --- | --- |
| 团队席位 | TEAM ROSTER |
| 协作看板 | OPERATIONS BOARD |
| 工作动态 | ACTIVITY FEED |
| 当前任务 | ACTIVE TASK |
| 市场环境 | MARKET CONTEXT |
| 团队决议 | TEAM CORE |
| 当前仓位 | POSITION STATE |
| 决策记录 | DECISION TAPE |
| 执行回放 | EXECUTION REPLAY |

Humorous status is allowed only on Agent staff cards and low-risk activity.
Risk alerts, trade confirmations, settlement records and audit trails use precise
language.
