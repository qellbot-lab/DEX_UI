import assert from 'node:assert/strict'
import {
  AGENT_HUMOR_LIBRARY,
  advanceV4Runtime,
  createV4Candles,
  createV4RuntimeState,
  getV4LaneTasks,
  getV4LivePosition,
  getV4TaskAgents,
  getV4TeamCoreState,
} from '../src/runtimeV4Engine.js'
import {
  MEETING_COUNTDOWN_AT_MS,
  MEETING_END_MS,
  MEETING_GATHER_MS,
  MEETING_ROLE_LABELS,
  createMeetingActivities,
  createMeetingAlert,
  createMeetingMinutes,
  createMeetingState,
  getMeetingPhase,
} from '../src/runtimeMeeting.js'

const advanceTo = (timeMs) => advanceV4Runtime(createV4RuntimeState(), timeMs)

const expectedHumorMoods = {
  buffett: ['working', 'collab', 'waiting', 'win'],
  dalio: ['working', 'collab', 'incident', 'waiting'],
  livermore: ['working', 'collab', 'waiting', 'loss'],
  simons: ['working', 'collab', 'waiting', 'win'],
  taleb: ['working', 'collab', 'incident', 'waiting'],
}

assert.deepEqual(
  Object.keys(AGENT_HUMOR_LIBRARY),
  Object.keys(expectedHumorMoods),
  'The humor library should cover the full five-Agent team',
)
Object.entries(expectedHumorMoods).forEach(([agentId, moods]) => {
  assert.deepEqual(
    Object.keys(AGENT_HUMOR_LIBRARY[agentId]),
    moods,
    `${agentId} should retain every runtime humor category`,
  )
  moods.forEach((mood) => {
    const entries = AGENT_HUMOR_LIBRARY[agentId][mood]
    assert.equal(entries.length, 3, `${agentId}.${mood} should contain exactly three lines`)
    assert.ok(
      entries.every((entry) => typeof entry === 'string' && entry.trim().length > 0),
      `${agentId}.${mood} should contain only non-empty display copy`,
    )
  })
})

const collaboration = advanceTo(4_000)
assert.deepEqual(
  getV4TaskAgents(collaboration, 'liquidity-break').map((agent) => agent.agentId),
  ['dalio', 'simons'],
  'Dalio and Simons should independently collaborate on the liquidity task',
)

const moved = advanceTo(5_000)
assert.equal(
  moved.tasks['liquidity-break'].lane,
  1,
  'The liquidity task should move to analysis after its handoff event',
)

const firstCycleHumor = advanceTo(1_500).agents.buffett.humor
const nextCycleHumor = advanceTo(61_500).agents.buffett.humor
assert.equal(typeof firstCycleHumor, 'string', 'Agent humor must materialize as display-ready copy')
assert.notEqual(
  firstCycleHumor,
  nextCycleHumor,
  'Repeated runtime cycles should rotate Agent humor instead of replaying one line',
)

const openingPosition = getV4LivePosition(advanceTo(0))
const livePositionPulse = getV4LivePosition(advanceTo(600))
assert.notEqual(
  openingPosition,
  livePositionPulse,
  'The displayed position should pulse between trade events instead of remaining static',
)

const openingTeamCore = getV4TeamCoreState(0)
const finalOpeningStage = getV4TeamCoreState(5_399)
const nextTeamCore = getV4TeamCoreState(5_400)
assert.equal(finalOpeningStage.stageIndex, 5, 'The Team Core light should fill all six stages')
assert.notEqual(
  openingTeamCore.label,
  nextTeamCore.label,
  'A completed Team Core light cycle must advance to a new title',
)
assert.equal(nextTeamCore.stageIndex, 0, 'A new Team Core title should restart the light sequence')

const alertOpened = advanceTo(9_300)
assert.equal(alertOpened.alert?.status, 'error', 'The data-source alert should open')

const alertHandling = advanceTo(11_000)
assert.equal(alertHandling.alert?.status, 'handling', 'The alert should enter handling')
assert.equal(alertHandling.agents.dalio.stateLabel, '救火中', 'Dalio should own recovery')

const alertResolved = advanceTo(14_500)
assert.equal(alertResolved.alert?.status, 'resolved', 'The alert should resolve')

const alertClosed = advanceTo(16_100)
assert.equal(alertClosed.alert, null, 'The resolved alert should leave the overlay')

const hedgeTrade = advanceTo(19_000)
assert.equal(hedgeTrade.metrics.position, 42, 'The hedge should lower the live position')
assert.equal(hedgeTrade.tradeMarkers.at(-1)?.label, 'S', 'The hedge should emit an S marker')

const reentryTrade = advanceTo(39_100)
assert.equal(reentryTrade.metrics.position, 47, 'The re-entry event should lift the position')
assert.equal(reentryTrade.tradeMarkers.at(-1)?.label, 'B', 'Re-entry should emit a B marker')

const afterCycleBoundary = advanceTo(61_100)
assert.equal(
  afterCycleBoundary.metrics.position,
  58,
  'The next cycle must preserve portfolio state instead of globally resetting it',
)
assert.ok(
  afterCycleBoundary.metrics.assets > createV4RuntimeState().metrics.assets,
  'The portfolio ledger should carry forward accumulated event effects',
)

const initialLaneOrder = getV4LaneTasks(advanceTo(1_500), 0).map((task) => task.id)
const progressOnlyLaneOrder = getV4LaneTasks(advanceTo(2_100), 0).map((task) => task.id)
assert.deepEqual(
  progressOnlyLaneOrder,
  initialLaneOrder,
  'Progress updates must not reorder cards inside a lane',
)

const candleState = advanceTo(39_100)
const candles = createV4Candles(candleState.timeMs, candleState.tradeMarkers, 28)
assert.equal(candles.length, 28, 'The market chart should keep a fixed candle window')
assert.ok(candles.some((candle) => candle.marker?.label === 'S'), 'The chart should retain S markers')
assert.ok(candles.some((candle) => candle.marker?.label === 'B'), 'The chart should retain B markers')
assert.ok(
  candles.every((candle) => candle.high >= Math.max(candle.open, candle.close)
    && candle.low <= Math.min(candle.open, candle.close)),
  'Every generated candle must have valid OHLC geometry',
)

const meetingTask = candleState.tasks['tape-confirmation']
const meeting = createMeetingState(meetingTask, 2, candleState.timeMs)
assert.equal(
  MEETING_COUNTDOWN_AT_MS,
  10_000,
  'The meeting auto-close countdown should begin after ten seconds',
)
assert.equal(
  MEETING_END_MS,
  15_000,
  'A meeting should auto-close after the five-second countdown',
)
assert.equal(
  new Set(Object.values(meeting.roles)).size,
  MEETING_ROLE_LABELS.length,
  'Every meeting should assign five distinct roles',
)
assert.equal(getMeetingPhase(meeting, 0), 'gathering', 'A meeting should begin with Agent gathering')
assert.equal(
  getMeetingPhase(meeting, MEETING_GATHER_MS),
  'active',
  'A gathered meeting should enter its active discussion phase',
)
assert.equal(
  getMeetingPhase(meeting, MEETING_COUNTDOWN_AT_MS),
  'countdown',
  'A long meeting should enter the five-second countdown phase',
)
const meetingActivities = createMeetingActivities(meeting, 17_500)
assert.ok(
  meetingActivities.every((entry) => entry.detail.includes(meetingTask.title)
    || entry.detail.includes(meetingTask.skill)
    || entry.detail.includes(meetingTask.factor)
    || entry.detail.includes(meetingTask.deliverable)),
  'Every meeting activity must remain tied to the selected task',
)
assert.equal(
  createMeetingAlert(meeting, MEETING_COUNTDOWN_AT_MS)?.actorLabel,
  'AUTO CLOSE · 5s',
  'The meeting alert should start with a five-second auto-close countdown',
)
assert.equal(
  createMeetingAlert(meeting, MEETING_END_MS - 500)?.actorLabel,
  'AUTO CLOSE · 1s',
  'The meeting alert should count down to the final second',
)
assert.equal(
  createMeetingMinutes(meeting, MEETING_END_MS).title,
  '本次会议纪要',
  'Meeting completion should materialize a downloadable minutes task',
)

console.log('V4 runtime engine verification passed')
