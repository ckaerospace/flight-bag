import { firstPhase, missionById } from './data.ts'
import type { Lang, MissionId, Persisted, PhaseId, View } from './types.ts'

const KEY = 'flightbag.v1'

function emptyChecks(): Persisted['checks'] {
  return {
    'long-day': {},
    car: {},
    overnight: {},
  }
}

function defaultLang(): Lang {
  const n = navigator.language.toLowerCase()
  if (n.startsWith('zh')) return 'zh-Hant'
  return 'de'
}

function defaults(): Persisted {
  return {
    v: 1,
    lang: defaultLang(),
    missionId: 'long-day',
    view: 'mission',
    phaseByMission: {
      'long-day': 'night-before',
      car: 'night-before',
      overnight: 'night-before',
    },
    checks: emptyChecks(),
  }
}

function parse(raw: string | null): Persisted {
  const base = defaults()
  if (!raw) return base
  try {
    const data = JSON.parse(raw) as Partial<Persisted>
    if (data.v !== 1) return base
    const missionId: MissionId =
      data.missionId && data.missionId in missionById ? data.missionId : base.missionId
    const lang: Lang = parseLang(data.lang)
    const view: View = data.view === 'flight' ? 'flight' : 'mission'
    const phaseByMission = { ...base.phaseByMission, ...data.phaseByMission }
    for (const id of Object.keys(missionById) as MissionId[]) {
      const allowed = new Set(missionById[id].phases.map((p) => p.id))
      if (!allowed.has(phaseByMission[id])) {
        phaseByMission[id] = firstPhase(id)
      }
    }
    return {
      v: 1,
      lang,
      missionId,
      view,
      phaseByMission,
      checks: {
        'long-day': { ...data.checks?.['long-day'] },
        car: { ...data.checks?.car },
        overnight: { ...data.checks?.overnight },
      },
    }
  } catch {
    return base
  }
}

export function load(): Persisted {
  return parse(localStorage.getItem(KEY))
}

export function save(state: Persisted): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function isChecked(state: Persisted, itemId: string): boolean {
  return Boolean(state.checks[state.missionId][itemId])
}

export function toggleItem(state: Persisted, itemId: string): Persisted {
  const mission = state.missionId
  const next = { ...state.checks[mission], [itemId]: !state.checks[mission][itemId] }
  return {
    ...state,
    checks: { ...state.checks, [mission]: next },
  }
}

export function setMission(state: Persisted, missionId: MissionId): Persisted {
  return { ...state, missionId, view: 'mission' }
}

export function setPhase(state: Persisted, phaseId: PhaseId): Persisted {
  return {
    ...state,
    view: 'mission',
    phaseByMission: { ...state.phaseByMission, [state.missionId]: phaseId },
  }
}

export function parseLang(raw: string | null | undefined): Lang {
  const v = (raw ?? '').toLowerCase()
  if (v === 'zh' || v === 'zh-hant' || v === 'zhhant' || v === 'zh-tw') {
    return 'zh-Hant'
  }
  return 'de'
}

export function setLang(state: Persisted, lang: Lang): Persisted {
  return { ...state, lang: lang === 'zh-Hant' ? 'zh-Hant' : 'de' }
}

export function toggleLang(state: Persisted): Persisted {
  return { ...state, lang: state.lang === 'de' ? 'zh-Hant' : 'de' }
}

export function setView(state: Persisted, view: View): Persisted {
  return { ...state, view }
}

export function resetMission(state: Persisted): Persisted {
  return {
    ...state,
    checks: { ...state.checks, [state.missionId]: {} },
    phaseByMission: {
      ...state.phaseByMission,
      [state.missionId]: firstPhase(state.missionId),
    },
  }
}

export function phaseProgress(
  state: Persisted,
  missionId: MissionId,
  phaseId: PhaseId,
): { done: number; total: number } {
  const phase = missionById[missionId].phases.find((p) => p.id === phaseId)
  if (!phase) return { done: 0, total: 0 }
  const required = phase.items.filter((i) => i.required)
  const done = required.filter((i) => state.checks[missionId][i.id]).length
  return { done, total: required.length }
}
