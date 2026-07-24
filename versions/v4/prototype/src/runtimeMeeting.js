import { V3_TEAM_IDS } from './runtimeV4Engine.js'

export const MEETING_GATHER_MS = 1_600
export const MEETING_WANDER_MS = 7_000
export const MEETING_COUNTDOWN_AT_MS = 20_000
export const MEETING_END_MS = 25_000

export const MEETING_ROLE_LABELS = [
  '正在汇报',
  '记录中',
  '有异议',
  '摸鱼ing',
  '申请发言',
]

const MEETING_ROLE_TONES = {
  正在汇报: 'acid',
  记录中: 'cyan',
  有异议: 'rose',
  '摸鱼ing': 'steel',
  申请发言: 'ember',
}

const hashText = (text) => Array.from(text).reduce(
  (hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16_777_619) >>> 0,
  2_166_136_261,
)

const seededShuffle = (values, seedText) => {
  const result = [...values]
  let seed = hashText(seedText)

  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0
    const target = seed % (index + 1)
    const current = result[index]
    result[index] = result[target]
    result[target] = current
  }

  return result
}

export function createMeetingState(task, runId, startedAt) {
  const shuffledRoles = seededShuffle(MEETING_ROLE_LABELS, `${task.id}:${runId}:${startedAt}`)

  return {
    id: `meeting-${runId}-${task.id}-${startedAt}`,
    targetTaskId: task.id,
    target: {
      id: task.id,
      title: task.title,
      skill: task.skill,
      factor: task.factor,
      deliverable: task.deliverable,
    },
    roles: Object.fromEntries(
      V3_TEAM_IDS.map((agentId, index) => [agentId, shuffledRoles[index]]),
    ),
    startedAt,
  }
}

export function getMeetingPhase(meeting, elapsedMs) {
  if (!meeting) return 'idle'
  if (elapsedMs < MEETING_GATHER_MS) return 'gathering'
  if (elapsedMs < MEETING_COUNTDOWN_AT_MS) return 'active'
  return 'countdown'
}

export function getMeetingAgentByRole(meeting, roleLabel) {
  return Object.entries(meeting?.roles ?? {})
    .find(([, label]) => label === roleLabel)?.[0] ?? null
}

export function getMeetingRoleTone(roleLabel) {
  return MEETING_ROLE_TONES[roleLabel] ?? 'steel'
}

export function createMeetingActivities(meeting, elapsedMs) {
  if (!meeting) return []

  const speaker = getMeetingAgentByRole(meeting, '正在汇报')
  const recorder = getMeetingAgentByRole(meeting, '记录中')
  const dissenter = getMeetingAgentByRole(meeting, '有异议')
  const wanderer = getMeetingAgentByRole(meeting, '摸鱼ing')
  const requester = getMeetingAgentByRole(meeting, '申请发言')
  const { title, skill, factor, deliverable } = meeting.target
  const script = [
    {
      offset: 0,
      from: 'TEAM CORE',
      to: 'ALL',
      action: '发出会议召集',
      detail: `围绕「${title}」启动联合复核`,
      tone: 'acid',
    },
    {
      offset: MEETING_GATHER_MS,
      from: speaker,
      to: 'TEAM CORE',
      action: '开始议题汇报',
      detail: `${skill} · 当前假设与证据链`,
      tone: 'acid',
    },
    {
      offset: 4_000,
      from: recorder,
      to: speaker,
      action: '同步会议纪要',
      detail: `${factor} 已写入复核清单`,
      tone: 'cyan',
    },
    {
      offset: 6_200,
      from: dissenter,
      to: speaker,
      action: '提出反向意见',
      detail: `请求重验「${title}」的边界条件`,
      tone: 'rose',
    },
    {
      offset: 8_500,
      from: requester,
      to: 'TEAM CORE',
      action: '申请补充发言',
      detail: `${deliverable} 需要追加执行约束`,
      tone: 'ember',
    },
    {
      offset: 11_000,
      from: wanderer,
      to: 'ALL',
      action: '短暂离席',
      detail: `仍在旁听「${title}」的讨论`,
      tone: 'steel',
    },
    {
      offset: 14_000,
      from: speaker,
      to: dissenter,
      action: '回应异议',
      detail: `${factor} 已完成第二轮交叉验证`,
      tone: 'acid',
    },
    {
      offset: 17_000,
      from: recorder,
      to: 'TEAM CORE',
      action: '提交纪要草案',
      detail: `「${title}」结论与未决项均已归档`,
      tone: 'cyan',
    },
    {
      offset: 19_500,
      from: 'TEAM CORE',
      to: 'ALL',
      action: '收敛会议结论',
      detail: `准备生成「${title}」会议纪要`,
      tone: 'acid',
    },
    {
      offset: MEETING_COUNTDOWN_AT_MS,
      from: 'TEAM CORE',
      to: 'ALL',
      action: '进入结束倒计时',
      detail: `5 秒后恢复 Runtime · ${title}`,
      tone: 'ember',
    },
  ]

  return script
    .filter((entry) => entry.offset <= elapsedMs)
    .map((entry, index) => ({
      ...entry,
      id: `${meeting.id}-activity-${index}`,
      at: meeting.startedAt + entry.offset,
    }))
    .reverse()
}

export function createMeetingAlert(meeting, elapsedMs) {
  if (!meeting || elapsedMs < MEETING_COUNTDOWN_AT_MS) return null

  const seconds = Math.max(1, Math.ceil((MEETING_END_MS - elapsedMs) / 1_000))
  return {
    id: `${meeting.id}-countdown`,
    status: 'handling',
    title: `会议将在 ${seconds} 秒后结束`,
    detail: `「${meeting.target.title}」会议纪要正在归档`,
    actorId: 'TEAM CORE',
    actorLabel: `AUTO CLOSE · ${seconds}s`,
  }
}

export function createMeetingMinutes(meeting, endedAt, reason = 'manual') {
  const speakerId = getMeetingAgentByRole(meeting, '正在汇报')
  const recorderId = getMeetingAgentByRole(meeting, '记录中')

  return {
    id: `minutes-${meeting.id}`,
    title: '本次会议纪要',
    targetTaskId: meeting.targetTaskId,
    targetTitle: meeting.target.title,
    skill: meeting.target.skill,
    factor: meeting.target.factor,
    deliverable: meeting.target.deliverable,
    conclusion: `${meeting.target.skill} 与 ${meeting.target.factor} 已完成交叉复核`,
    action: `下一步交付：${meeting.target.deliverable}`,
    endedAt,
    reason,
    roles: meeting.roles,
    speakerId,
    recorderId,
  }
}
