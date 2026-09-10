import { getPhase, missionById, missions } from './data.ts'
import { items, ui } from './i18n.ts'
import {
  isChecked,
  load,
  phaseProgress,
  resetMission,
  save,
  setMission,
  setPhase,
  setView,
  toggleItem,
  toggleLang,
} from './store.ts'
import type { Item, Lang, MissionId, Persisted, PhaseId } from './types.ts'

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function itemLabel(lang: Lang, id: string): string {
  return items[lang][id] ?? id
}

function assertCopy(): void {
  for (const mission of missions) {
    for (const phase of mission.phases) {
      for (const item of phase.items) {
        if (!items.de[item.id] || !items['zh-Hant'][item.id]) {
          throw new Error(`Missing i18n for ${item.id}`)
        }
      }
    }
  }
}

export function boot(root: HTMLElement): void {
  assertCopy()
  let state = load()
  let confirmOpen = false

  const persist = (next: Persisted) => {
    state = next
    save(state)
    paint()
  }

  const paint = () => {
    const copy = ui[state.lang]
    const mission = missionById[state.missionId]
    const phaseId = state.phaseByMission[state.missionId]
    const phase = getPhase(state.missionId, phaseId) ?? mission.phases[0]
    const onDoor = phase.id === 'door' && state.view === 'mission'
    const progress = phaseProgress(state, state.missionId, phase.id)
    const holdCount = progress.total - progress.done
    const released = onDoor && holdCount === 0
    document.documentElement.lang = state.lang === 'de' ? 'de' : 'zh-Hant'
    document.title = `${copy.appName} · ${copy.subtitle}`

    const missionName = copy.missions[state.missionId].name
    const headerMission =
      state.view === 'flight' ? copy.flightTitle : `${copy.missionNow}: ${missionName}`

    const phaseChips = mission.phases
      .map((p) => {
        const pg = phaseProgress(state, state.missionId, p.id)
        const active = p.id === phase.id && state.view === 'mission'
        return `<button type="button" class="chip${active ? ' is-on' : ''}${p.id === 'door' ? ' chip-door' : ''}" data-act="phase" data-id="${p.id}" aria-pressed="${active ? 'true' : 'false'}">
          <span class="chip-name">${copy.phases[p.id]}</span>
          <span class="chip-count">${copy.phaseOf(pg.done, pg.total)}</span>
        </button>`
      })
      .join('')

    const required = phase.items.filter((i) => i.required)
    const optional = phase.items.filter((i) => !i.required)
    const showGroups = phase.id === 'pack'

    const row = (id: string, requiredItem: boolean, memory: boolean, checked: boolean) => {
      const label = itemLabel(state.lang, id)
      return `<button type="button" class="item${checked ? ' is-checked' : ''}${memory ? ' is-memory' : ''}${requiredItem ? ' is-req' : ' is-opt'}" data-act="toggle" data-id="${escapeHtml(id)}" role="checkbox" aria-checked="${checked ? 'true' : 'false'}">
        <span class="box" aria-hidden="true">${checked ? 'X' : ''}</span>
        <span class="item-text">
          <span class="item-label">${escapeHtml(label)}</span>
          <span class="item-flag">${requiredItem ? copy.required : copy.optional}</span>
        </span>
      </button>`
    }

    const block = (list: Item[], requiredItem: boolean) => {
      let lastGroup = ''
      return list
        .map((i) => {
          let head = ''
          if (showGroups && i.group && i.group !== lastGroup) {
            lastGroup = i.group
            head = `<p class="sec">${copy.groups[i.group]}</p>`
          }
          return (
            head +
            row(
              i.id,
              requiredItem,
              Boolean(i.memory) || phase.id === 'door',
              isChecked(state, i.id),
            )
          )
        })
        .join('')
    }

    const listHtml =
      state.view === 'flight'
        ? copy.flightLines
            .map(
              (sec) => `<section class="tip-block">
            <h3>${escapeHtml(sec.h)}</h3>
            <ol>${sec.lines.map((ln) => `<li>${escapeHtml(ln)}</li>`).join('')}</ol>
          </section>`,
            )
            .join('')
        : `${block(required, true)}
          ${
            optional.length
              ? `<p class="opt-div">${copy.optionalDivider}</p>${block(optional, false)}`
              : ''
          }`

    const status =
      state.view === 'flight'
        ? `<button type="button" class="status status-adv" data-act="close-flight">${copy.flightClose}</button>`
        : onDoor
          ? `<div class="status ${released ? 'is-release' : 'is-hold'}" role="status" aria-live="assertive">
              ${
                released
                  ? ''
                  : `<span class="status-count" aria-hidden="true">${holdCount}</span>`
              }
              <div class="status-copy">
                <span class="status-kicker">${released ? copy.releaseKicker : copy.holdKicker}</span>
                <span class="status-word">${released ? copy.release : copy.hold}</span>
                <span class="status-sub">${released ? copy.releaseSub(progress.total) : copy.holdSub(holdCount, progress.total)}</span>
              </div>
            </div>`
          : `<div class="status status-quiet" role="status">${escapeHtml(copy.phases[phase.id])} · ${copy.phaseOf(progress.done, progress.total)}</div>`

    const tabs = missions
      .map((m) => {
        const on = m.id === state.missionId && state.view === 'mission'
        return `<button type="button" class="tab${on ? ' is-on' : ''}" data-act="mission" data-id="${m.id}" aria-pressed="${on ? 'true' : 'false'}">${copy.missions[m.id].tab}</button>`
      })
      .join('')

    root.innerHTML = `
      <div class="shell${onDoor ? (released ? ' shell-go' : ' shell-hold') : ''}">
        <header class="top">
          <div class="brand">
            <p class="logo">${copy.appName}</p>
            <p class="sub">${copy.subtitle}</p>
          </div>
          <div class="top-actions">
            <button type="button" class="lang" data-act="lang-toggle" aria-label="DE / 繁">
              <span class="lang-btn${state.lang === 'de' ? ' is-on' : ''}">DE</span>
              <span class="lang-btn${state.lang === 'zh-Hant' ? ' is-on' : ''}">繁</span>
            </button>
            <button type="button" class="reset-btn" data-act="reset-ask" ${state.view === 'flight' ? 'disabled' : ''}>${copy.reset}</button>
          </div>
        </header>
        <p class="mission-line${state.view === 'flight' ? ' is-adv' : ''}">${escapeHtml(headerMission)}</p>
        ${state.view === 'flight' ? `<p class="door-note">${copy.flightSub}</p>` : ''}
        ${onDoor ? `<p class="door-note">${copy.doorBanner}</p>` : ''}
        <div class="kneeboard">
          <div class="rings" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <div class="card">
            <div class="card-stripe" aria-hidden="true"></div>
            <div class="list">${listHtml}</div>
            <p class="rev">${copy.rev}</p>
          </div>
        </div>
        ${status}
        ${
          state.view === 'flight'
            ? ''
            : `<div class="phases" role="tablist">${phaseChips}</div>`
        }
        <nav class="tabs" aria-label="Mission">
          ${tabs}
          <button type="button" class="tab tab-flight${state.view === 'flight' ? ' is-on' : ''}" data-act="flight" aria-pressed="${state.view === 'flight' ? 'true' : 'false'}">${copy.flightTab}</button>
        </nav>
      </div>
      ${
        confirmOpen
          ? `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="rst-title">
              <div class="modal-card">
                <h2 id="rst-title">${copy.resetTitle}</h2>
                <p>${copy.resetBody}</p>
                <button type="button" class="modal-cancel" data-act="reset-no">${copy.cancel}</button>
                <button type="button" class="modal-go" data-act="reset-yes">${copy.confirmReset}</button>
              </div>
            </div>`
          : ''
      }
    `
  }

  root.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')
    if (!el) return
    const act = el.dataset.act
    if (act === 'toggle') {
      persist(toggleItem(state, el.dataset.id ?? ''))
    } else if (act === 'phase') {
      persist(setPhase(state, el.dataset.id as PhaseId))
    } else if (act === 'mission') {
      persist(setMission(state, el.dataset.id as MissionId))
    } else if (act === 'flight') {
      persist(setView(state, 'flight'))
    } else if (act === 'close-flight') {
      persist(setView(state, 'mission'))
    } else if (act === 'lang-toggle') {
      persist(toggleLang(state))
    } else if (act === 'reset-ask') {
      confirmOpen = true
      paint()
    } else if (act === 'reset-no') {
      confirmOpen = false
      paint()
    } else if (act === 'reset-yes') {
      confirmOpen = false
      persist(resetMission(state))
    }
  })

  paint()
}
