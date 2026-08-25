export type StepStatus = 'locked' | 'available' | 'active' | 'completed' | 'error'

export interface ExperimentStep {
  id: string
  order: number
  title: string
  description: string
  requiredInstruments: string[]
  requiredReagents: string[]
  action: StepAction
  safetyTips: string[]
  expectedPhenomena: string[]
  status: StepStatus
}

export type StepAction =
  | { type: 'select_instrument'; instrumentId: string }
  | { type: 'add_reagent'; reagentId: string; targetInstrument: string }
  | { type: 'heat'; instrumentId: string; duration: number }
  | { type: 'observe'; description: string }
  | { type: 'collect_gas'; method: 'upward' | 'downward' | 'water' }
  | { type: 'record'; dataField: string }

export interface Experiment {
  id: string
  name: string
  category: 'acid-base' | 'metal-acid' | 'gas-preparation'
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  principle: {
    equation: string
    explanation: string
  }
  instruments: string[]
  reagents: string[]
  steps: ExperimentStep[]
  reactions: ReactionRule[]
  safetyRules: SafetyRule[]
}

export interface ReactionRule {
  id: string
  reactants: { id: string; type: 'reagent' | 'instrument' }[]
  conditions: {
    needHeat?: boolean
    needCatalyst?: string
    temperature?: { min: number; max: number }
  }
  products: { name: string; formula: string; state: 'solid' | 'liquid' | 'gas' }[]
  equation: string
  phenomena: Phenomenon[]
  duration: number
}

export interface Phenomenon {
  type: 'color_change' | 'bubble' | 'precipitate' | 'temperature_change' | 'gas_release' | 'dissolve' | 'flame'
  description: string
  visual: {
    color?: string
    intensity?: number
    duration?: number
  }
}

export type RiskLevel = 'info' | 'warning' | 'danger'

export interface SafetyRule {
  id: string
  trigger: {
    type: 'incompatible_reagents' | 'wrong_order' | 'missing_instrument' | 'wrong_heating' | 'excess_reagent'
    reagentIds?: string[]
    instrumentIds?: string[]
    stepId?: string
  }
  riskLevel: RiskLevel
  message: string
  suggestion: string
  blocking: boolean
}
