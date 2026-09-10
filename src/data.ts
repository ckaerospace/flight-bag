import type { Item, ItemGroup, Mission, MissionId, PhaseId } from './types.ts'

const R = (
  id: string,
  groupOrMemory?: ItemGroup | boolean,
  group?: ItemGroup,
): Item => {
  if (typeof groupOrMemory === 'string') {
    return { id, required: true, memory: false, group: groupOrMemory }
  }
  return { id, required: true, memory: Boolean(groupOrMemory), group }
}

const O = (id: string, group?: ItemGroup): Item => ({
  id,
  required: false,
  group,
})

export const missions: Mission[] = [
  {
    id: 'long-day',
    phases: [
      {
        id: 'night-before',
        items: [
          R('nappies-stock'),
          R('charge-powerbank'),
          R('charge-phone'),
          R('parent-top-ready'),
          R('outfits-laid'),
          R('wetbag-staged'),
          O('feed-prep'),
          O('weather-layer'),
        ],
      },
      {
        id: 'pack',
        items: [
          R('nappies', 'change'),
          R('wipes', 'change'),
          R('changing-mat', 'change'),
          R('cream', 'change'),
          R('wetbag', 'change'),
          R('feed', 'feed'),
          R('outfits', 'clothes'),
          R('burp-cloths', 'clothes'),
          R('muslin', 'clothes'),
          R('parent-top', 'parent'),
          R('sanitizer', 'parent'),
          R('powerbank', 'parent'),
          O('pacifier-clip'),
          O('sun-hat-bug', 'outdoor'),
        ],
      },
      {
        id: 'door',
        items: [
          R('baby', true),
          R('keys', true),
          R('wallet', true),
          R('phone', true),
          R('bag-in-hand', true),
          R('feed-ready', true),
        ],
      },
      {
        id: 'transit',
        items: [
          R('snacks'),
          R('toys-books'),
          R('tissues'),
          R('muslin-access'),
          O('spare-pacifier'),
        ],
      },
      {
        id: 'return',
        items: [
          R('dirty-bag'),
          R('restock-nappies'),
          R('restock-wipes'),
          R('recharge-powerbank'),
          R('hang-damp'),
          O('wash-parent-top'),
        ],
      },
    ],
  },
  {
    id: 'car',
    phases: [
      {
        id: 'night-before',
        items: [
          R('nappies-stock'),
          R('charge-powerbank'),
          R('seat-base-check'),
          R('sun-shade-car'),
          R('adult-snacks-prep'),
          R('outfits-laid'),
          O('cooler-thermos'),
          O('picnic-blanket'),
        ],
      },
      {
        id: 'pack',
        items: [
          R('nappies', 'change'),
          R('wipes', 'change'),
          R('changing-mat', 'change'),
          R('cream', 'change'),
          R('wetbag', 'change'),
          R('feed', 'feed'),
          R('outfits', 'clothes'),
          R('muslin', 'clothes'),
          R('parent-top', 'parent'),
          R('sanitizer', 'parent'),
          R('powerbank', 'parent'),
          R('caddy-ready', 'gear'),
          O('pacifier-clip'),
          O('sun-hat-bug', 'outdoor'),
        ],
      },
      {
        id: 'kit',
        items: [
          R('caddy-nappies'),
          R('caddy-wipes'),
          R('caddy-outfit'),
          R('caddy-parent-shirt'),
          R('caddy-in-cabin'),
          R('sun-shade-fitted'),
          R('adult-water'),
          O('picnic-blanket'),
          O('cooler-thermos'),
        ],
      },
      {
        id: 'door',
        items: [
          R('seat-locked', true),
          R('harness-snug', true),
          R('baby', true),
          R('keys', true),
          R('phone', true),
          R('bag-and-caddy', true),
        ],
      },
      {
        id: 'stops',
        items: [
          R('never-leave-car', true),
          R('remove-from-seat'),
          R('plan-next-stop'),
          R('adult-water-snacks'),
          R('tissues'),
          O('snacks'),
          O('spare-pacifier'),
          O('toys-books'),
        ],
      },
      {
        id: 'return',
        items: [
          R('restock-caddy'),
          R('restock-nappies'),
          R('restock-wipes'),
          R('dirty-bag'),
          R('recharge-powerbank'),
          O('sun-shade-stow'),
        ],
      },
    ],
  },
  {
    id: 'overnight',
    phases: [
      {
        id: 'night-before',
        items: [
          R('sleep-space'),
          R('charge-white-noise'),
          R('pack-chargers'),
          R('meds-thermo-prep'),
          R('extra-nappies-night'),
          R('more-outfits-prep'),
          O('charge-monitor'),
          O('pump-prep'),
        ],
      },
      {
        id: 'pack',
        items: [
          R('nappies', 'change'),
          R('wipes', 'change'),
          R('changing-mat', 'change'),
          R('cream', 'change'),
          R('wetbag', 'change'),
          R('feed', 'feed'),
          R('outfits-several', 'clothes'),
          R('muslin', 'clothes'),
          R('sheets-sleepsack', 'sleep'),
          R('white-noise-charger', 'sleep'),
          R('parent-top', 'parent'),
          R('meds-thermometer', 'parent'),
          O('monitor-charger', 'sleep'),
          O('pump-soap-bags'),
          O('blackout-mask', 'sleep'),
        ],
      },
      {
        id: 'door',
        items: [
          R('baby', true),
          R('keys', true),
          R('wallet', true),
          R('phone', true),
          R('bag-in-hand', true),
          R('white-noise-door', true),
          R('meds-door', true),
          R('sleep-space-door', true),
        ],
      },
      {
        id: 'transit',
        items: [
          R('snacks'),
          R('toys-books'),
          R('tissues'),
          R('feed-ready'),
          O('spare-pacifier'),
        ],
      },
      {
        id: 'return',
        items: [
          R('dirty-laundry'),
          R('restock-nappies'),
          R('restock-wipes'),
          R('recharge-white-noise'),
          R('recharge-powerbank'),
          O('recharge-monitor'),
        ],
      },
    ],
  },
]

export const missionById = Object.fromEntries(
  missions.map((m) => [m.id, m]),
) as Record<MissionId, Mission>

export function firstPhase(missionId: MissionId): PhaseId {
  return missionById[missionId].phases[0].id
}

export function getPhase(missionId: MissionId, phaseId: PhaseId) {
  return missionById[missionId].phases.find((p) => p.id === phaseId)
}
