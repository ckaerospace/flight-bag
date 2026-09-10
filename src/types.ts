export type Lang = 'de' | 'zh-Hant'

export type MissionId = 'long-day' | 'car' | 'overnight'

export type PhaseId =
  | 'night-before'
  | 'pack'
  | 'kit'
  | 'door'
  | 'transit'
  | 'stops'
  | 'return'

export type View = 'mission' | 'flight'

export type ItemGroup =
  | 'change'
  | 'feed'
  | 'clothes'
  | 'parent'
  | 'gear'
  | 'sleep'
  | 'outdoor'

export interface Item {
  id: string
  required: boolean
  memory?: boolean
  group?: ItemGroup
}

export interface Phase {
  id: PhaseId
  items: Item[]
}

export interface Mission {
  id: MissionId
  phases: Phase[]
}

export interface Persisted {
  v: 1
  lang: Lang
  missionId: MissionId
  view: View
  phaseByMission: Record<MissionId, PhaseId>
  checks: Record<MissionId, Record<string, boolean>>
}
