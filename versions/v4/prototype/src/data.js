export const agents = [
  {
    id: 'buffett', code: 'VAL-01', name: '巴菲特', latin: 'WARREN BUFFETT', role: '价值',
    department: '价值发掘部', position: '实习生', grade: 'P2',
    thesis: '以现金流质量与安全边际约束买入价格。', return: 18.4, risk: 28, winRate: 67,
    color: 'acid', factors: ['现金流质量', '护城河', '安全边际'],
    fit: ['估值修复', '震荡慢牛', '高质量资产'], avoid: ['纯情绪行情', '无盈利成长'],
  },
  {
    id: 'wood', code: 'NAR-02', name: '木头姐', latin: 'CATHIE WOOD', role: '叙事',
    department: '未来叙事部', position: '首席布道员', grade: 'P7',
    thesis: '识别技术扩散、资本开支与预期重估的共振。', return: 31.2, risk: 74, winRate: 52,
    color: 'cyan', factors: ['技术扩散', '叙事强度', '资金斜率'],
    fit: ['创新周期', '流动性扩张', '主题突破'], avoid: ['流动性收缩', '高利率'],
  },
  {
    id: 'livermore', code: 'MOM-03', name: '利弗莫尔', latin: 'JESSE LIVERMORE', role: '动量',
    department: '动量捕捉部', position: '组长', grade: 'P7',
    thesis: '顺势跟随价格结构，只在确认后的加速段出手。', return: 25.7, risk: 61, winRate: 58,
    color: 'ember', factors: ['趋势强度', '突破确认', '止损纪律'],
    fit: ['趋势行情', '波动扩张', '危机反弹'], avoid: ['低波横盘', '假突破'],
  },
  {
    id: 'dalio', code: 'MAC-04', name: '达利欧', latin: 'RAY DALIO', role: '宏观',
    department: '宏观推演部', position: '部长', grade: 'P8',
    thesis: '从增长、通胀、流动性与政策组合判断大类资产。', return: 14.8, risk: 35, winRate: 63,
    color: 'cyan', factors: ['增长周期', '通胀路径', '流动性'],
    fit: ['政策拐点', '全球轮动', '危机对冲'], avoid: ['单一题材', '微盘行情'],
  },
  {
    id: 'lynch', code: 'GRW-05', name: '彼得·林奇', latin: 'PETER LYNCH', role: '成长',
    department: '成长侦察部', position: '资深研究员', grade: 'P6',
    thesis: '在可理解的业务里寻找盈利增速与估值错配。', return: 21.9, risk: 46, winRate: 61,
    color: 'acid', factors: ['盈利加速', '估值错配', '业务质量'],
    fit: ['盈利上修', '消费复苏', '中盘成长'], avoid: ['盈利下修', '叙事泡沫'],
  },
  {
    id: 'taleb', code: 'RSK-06', name: '塔勒布', latin: 'NASSIM TALEB', role: '风险',
    department: '风险否决部', position: '值班主任', grade: 'P8',
    thesis: '用凸性与尾部风险预算保护战队的生存能力。', return: 9.6, risk: 18, winRate: 71,
    color: 'rose', factors: ['尾部风险', '凸性保护', '脆弱性'],
    fit: ['极端波动', '相关性突变', '危机'], avoid: ['持续低波', '单边慢牛'],
  },
  {
    id: 'soros', code: 'REF-07', name: '索罗斯', latin: 'GEORGE SOROS', role: '反身性',
    department: '反身性实验部', position: '策略合伙人', grade: 'P9',
    thesis: '跟踪价格、叙事与参与者行为之间的反馈回路。', return: 27.4, risk: 68, winRate: 55,
    color: 'ember', factors: ['拥挤度', '反馈回路', '催化剂'],
    fit: ['宏观错位', '政策转向', '拥挤交易'], avoid: ['无催化价值', '封闭市场'],
  },
  {
    id: 'simons', code: 'QNT-08', name: '西蒙斯', latin: 'JIM SIMONS', role: '量化',
    department: '量化部', position: '部长', grade: 'P8',
    thesis: '从可重复的统计关系中提取短周期、低叙事信号。', return: 19.6, risk: 42, winRate: 64,
    color: 'steel', factors: ['统计套利', '均值回归', '信号衰减'],
    fit: ['高流动性', '多资产', '结构性偏差'], avoid: ['数据断层', '制度切换'],
  },
]

export const agentOrganizationLine = (agent, separator = ' · ') =>
  [agent.department, agent.position, agent.grade].filter(Boolean).join(separator)

export const events = [
  { id: 'black-monday', year: '1987', name: '黑色星期一', market: '美国股市', move: '−22.6%', duration: '1日', difficulty: 92, volatility: 96, tone: 'rose', activeAgents: 184, description: '程序化卖盘与流动性枯竭形成的极速崩跌。', objective: '在极短决策窗内控制损失并识别反弹条件。' },
  { id: 'dotcom', year: '2000', name: '互联网泡沫', market: '纳斯达克', move: '−78%', duration: '31个月', difficulty: 78, volatility: 82, tone: 'ember', activeAgents: 127, description: '高估值叙事退潮，盈利质量重新成为定价核心。', objective: '区分结构性成长与不可持续的估值扩张。' },
  { id: 'gfc', year: '2008', name: '全球金融危机', market: '全球资产', move: '−57%', duration: '17个月', difficulty: 96, volatility: 94, tone: 'rose', activeAgents: 263, description: '信用链断裂、去杠杆与政策响应交织的系统危机。', objective: '管理相关性突变，并在政策拐点后重建风险预算。' },
  { id: 'covid', year: '2020', name: '疫情熔断', market: '全球市场', move: '−34%', duration: '23日', difficulty: 86, volatility: 98, tone: 'rose', activeAgents: 219, description: '经济停摆预期与史无前例政策反应之间的急速切换。', objective: '处理信息不完备、流动性冲击与 V 型修复。' },
  { id: 'crypto-winter', year: '2022', name: '加密寒冬', market: 'BTC / ETH', move: '−73%', duration: '13个月', difficulty: 81, volatility: 88, tone: 'cyan', activeAgents: 306, description: '流动性收缩、杠杆清算与信用事件连续传导。', objective: '识别链上杠杆风险并约束叙事暴露。' },
  { id: 'ai-rally', year: '2023', name: 'AI 主升浪', market: '美股科技', move: '+112%', duration: '18个月', difficulty: 66, volatility: 59, tone: 'acid', activeAgents: 348, description: '资本开支、算力稀缺与盈利兑现推动的结构行情。', objective: '在拥挤度与盈利上修之间保持趋势敞口。' },
]

export const runtimeDecisions = [
  { time: '09:31', agent: 'MAC-04', action: '降低风险预算', skill: 'Liquidity Regime', subagent: 'Macro Scanner', confidence: 82, note: '美元流动性指标同步恶化，先削减组合杠杆。' },
  { time: '09:36', agent: 'RSK-06', action: '建立尾部保护', skill: 'Convexity Guard', subagent: 'Risk Sentinel', confidence: 91, note: '波动率曲面出现断层，保护成本仍低于预期损失。' },
  { time: '09:47', agent: 'MOM-03', action: '等待结构确认', skill: 'Breakout Filter', subagent: 'Tape Reader', confidence: 64, note: '下跌动量强，但成交结构尚未出现反转确认。' },
  { time: '10:18', agent: 'VAL-01', action: '分批建立仓位', skill: 'Margin of Safety', subagent: 'Quality Screener', confidence: 76, note: '高质量资产相对现金流已进入历史低分位。' },
]

export const leaderboard = [
  { rank: 1, name: 'Axiom North', code: 'TM-204', alpha: 94.8, drawdown: 8.6, consistency: 91, trend: '+4' },
  { rank: 2, name: 'Quiet Compounders', code: 'TM-031', alpha: 91.6, drawdown: 6.4, consistency: 95, trend: '—' },
  { rank: 3, name: 'Tailwind Office', code: 'TM-177', alpha: 89.2, drawdown: 10.1, consistency: 88, trend: '+2' },
  { rank: 4, name: 'Delta Assembly', code: 'TM-089', alpha: 86.5, drawdown: 12.3, consistency: 84, trend: '−1' },
  { rank: 5, name: 'Macro Foundry', code: 'TM-114', alpha: 84.7, drawdown: 9.8, consistency: 87, trend: '+3' },
  { rank: 6, name: 'QELL TEST TEAM', code: 'YOU-001', alpha: 82.9, drawdown: 11.7, consistency: 83, trend: '+7', mine: true },
  { rank: 7, name: 'Slow Signal', code: 'TM-266', alpha: 81.3, drawdown: 7.1, consistency: 92, trend: '−2' },
  { rank: 8, name: 'Reflexive Desk', code: 'TM-153', alpha: 79.8, drawdown: 15.4, consistency: 76, trend: '+1' },
]

export const performanceData = [
  { t: '1', team: 0, benchmark: 0 }, { t: '2', team: -3, benchmark: -4 },
  { t: '3', team: -7, benchmark: -12 }, { t: '4', team: -4, benchmark: -18 },
  { t: '5', team: 1, benchmark: -14 }, { t: '6', team: 7, benchmark: -8 },
  { t: '7', team: 10, benchmark: -5 }, { t: '8', team: 14, benchmark: 1 },
  { t: '9', team: 12, benchmark: 3 }, { t: '10', team: 18.6, benchmark: 6.4 },
]

export const marketData = [
  { t: '09:30', price: 100 }, { t: '09:36', price: 94 }, { t: '09:42', price: 88 },
  { t: '09:48', price: 82 }, { t: '09:54', price: 77 }, { t: '10:00', price: 74 },
  { t: '10:06', price: 79 }, { t: '10:12', price: 83 }, { t: '10:18', price: 86 },
  { t: '10:24', price: 91 }, { t: '10:30', price: 93 },
]
