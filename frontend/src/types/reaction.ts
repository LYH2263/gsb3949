export interface ReactionRule {
  id: string
  name: string
  description: string
  reactants: Reactant[]
  optionalReagents?: Reactant[]
  conditions: ReactionConditions
  products: Product[]
  equation: string
  phenomena: Phenomenon[]
  colorChanges?: ColorChange[]
  duration: number // seconds
}

export interface Reactant {
  type: 'reagent' | 'instrument'
  id: string
  required: boolean
}

export interface ReactionConditions {
  temperature?: { min: number; max: number }
  mixingOrder?: 'any' | 'specific'
  catalyst?: string
}

export interface Product {
  name: string
  formula: string
  state: 'solid' | 'liquid' | 'gas' | 'aqueous'
}

export interface Phenomenon {
  type: 'temperature_change' | 'gas_evolution' | 'color_change' | 'precipitation' | 'dissolution'
  description: string
  intensity: 'mild' | 'moderate' | 'strong' | 'very_strong'
}

export interface ColorChange {
  condition: string
  from: string
  to: string
  description: string
}

export interface ReactionResult {
  reaction: ReactionRule | null
  phenomena: string[]
  equation: string | null
  colorChange: ColorChange | null
  duration: number
}
