import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

const mem = new Map<string, string>()

const storage: Storage = {
  get length() {
    return mem.size
  },
  clear() {
    mem.clear()
  },
  getItem(key: string) {
    return mem.get(key) ?? null
  },
  key(index: number) {
    return [...mem.keys()][index] ?? null
  },
  removeItem(key: string) {
    mem.delete(key)
  },
  setItem(key: string, value: string) {
    mem.set(key, value)
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  configurable: true,
})
Object.defineProperty(globalThis, 'navigator', {
  value: { language: 'de-DE' },
  configurable: true,
})

const store = await import('./store.ts')

afterEach(() => {
  mem.clear()
})

test('reload restores mission, phase, and checks', () => {
  let state = store.load()
  state = store.setPhase(state, 'pack')
  state = store.toggleItem(state, 'nappies')
  state = store.toggleItem(state, 'wipes')
  store.save(state)

  const restored = store.load()
  assert.equal(restored.missionId, 'long-day')
  assert.equal(restored.phaseByMission['long-day'], 'pack')
  assert.equal(restored.checks['long-day'].nappies, true)
  assert.equal(restored.checks['long-day'].wipes, true)
  assert.equal(restored.checks['long-day'].cream, undefined)
})

test('switching mission keeps the other mission’s checks', () => {
  let state = store.load()
  state = store.toggleItem(state, 'nappies')
  store.save(state)

  state = store.setMission(state, 'car')
  state = store.setPhase(state, 'door')
  state = store.toggleItem(state, 'seat-locked')
  store.save(state)

  const restored = store.load()
  assert.equal(restored.missionId, 'car')
  assert.equal(restored.phaseByMission.car, 'door')
  assert.equal(restored.checks.car['seat-locked'], true)
  assert.equal(restored.checks['long-day'].nappies, true)

  const afterReset = store.resetMission(restored)
  assert.deepEqual(afterReset.checks.car, {})
  assert.equal(afterReset.checks['long-day'].nappies, true)
})
