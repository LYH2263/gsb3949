export interface Reagent {
  id: string
  name: string
  formula: string
  category: 'acid' | 'base' | 'salt' | 'metal' | 'oxide' | 'indicator' | 'other'
  state: 'solid' | 'liquid' | 'gas'
  color: string
  properties: string
  hazards: string[]
  concentration?: string
}
