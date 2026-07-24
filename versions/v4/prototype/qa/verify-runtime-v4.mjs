import assert from 'node:assert/strict'
import {
  advanceV4Runtime,
  createV4Candles,
  createV4RuntimeState,
  getV4LaneTasks,
  getV4LivePosition,
  getV4TaskAgents,
} from '../src/runtimeV4Engine.js'

const advanceTo = (timeMs) => advanceV4Runtime(createV4RuntimeState(), timeMs)

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

console.log('V4 runtime engine verification passed')
