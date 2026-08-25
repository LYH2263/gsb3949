import type { ReactionRule } from '../types/reaction'

export const reactionRules: ReactionRule[] = [
  {
    id: 'acid-base-neutralization',
    name: '酸碱中和反应',
    description: '酸和碱反应生成盐和水',
    reactants: [
      { type: 'reagent', id: 'hcl-dilute', required: true },
      { type: 'reagent', id: 'naoh-solution', required: true },
    ],
    optionalReagents: [
      { type: 'reagent', id: 'phenolphthalein', required: false },
    ],
    conditions: {
      temperature: { min: 20, max: 30 },
      mixingOrder: 'any',
    },
    products: [
      { name: '氯化钠', formula: 'NaCl', state: 'aqueous' },
      { name: '水', formula: 'H₂O', state: 'liquid' },
    ],
    equation: 'HCl + NaOH → NaCl + H₂O',
    phenomena: [
      {
        type: 'temperature_change',
        description: '溶液温度略有升高',
        intensity: 'mild',
      },
    ],
    colorChanges: [
      {
        condition: 'hasPhenolphthalein',
        from: 'pink',
        to: 'colorless',
        description: '酚酞指示剂由红色变为无色',
      },
    ],
    duration: 5,
  },
  {
    id: 'metal-acid-reaction',
    name: '金属与酸反应',
    description: '活泼金属与酸反应生成盐和氢气',
    reactants: [
      { type: 'reagent', id: 'zinc', required: true },
      { type: 'reagent', id: 'h2so4-dilute', required: true },
    ],
    conditions: {
      temperature: { min: 20, max: 25 },
    },
    products: [
      { name: '硫酸锌', formula: 'ZnSO₄', state: 'aqueous' },
      { name: '氢气', formula: 'H₂', state: 'gas' },
    ],
    equation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑',
    phenomena: [
      {
        type: 'gas_evolution',
        description: '产生大量无色气泡（氢气）',
        intensity: 'strong',
      },
      {
        type: 'dissolution',
        description: '锌粒逐渐溶解变小',
        intensity: 'moderate',
      },
    ],
    duration: 10,
  },
  {
    id: 'oxygen-preparation',
    name: '氧气制备',
    description: '过氧化氢在二氧化锰催化下分解',
    reactants: [
      { type: 'reagent', id: 'h2o2-solution', required: true },
      { type: 'reagent', id: 'mno2', required: true },
    ],
    conditions: {
      temperature: { min: 20, max: 25 },
      catalyst: 'mno2',
    },
    products: [
      { name: '水', formula: 'H₂O', state: 'liquid' },
      { name: '氧气', formula: 'O₂', state: 'gas' },
    ],
    equation: '2H₂O₂ →(MnO₂) 2H₂O + O₂↑',
    phenomena: [
      {
        type: 'gas_evolution',
        description: '迅速产生大量气泡（氧气）',
        intensity: 'very_strong',
      },
      {
        type: 'temperature_change',
        description: '反应放热，容器温度升高',
        intensity: 'moderate',
      },
    ],
    duration: 3,
  },
]

// Helper function to find matching reaction
export function findReaction(
  selectedReagents: string[]
): ReactionRule | null {
  for (const rule of reactionRules) {
    const requiredReagents = rule.reactants
      .filter(r => r.required)
      .map(r => r.id)
    
    const hasAllRequired = requiredReagents.every(id => 
      selectedReagents.includes(id)
    )
    
    if (hasAllRequired) {
      return rule
    }
  }
  return null
}

// Helper function to check if reaction will occur
export function willReact(
  selectedReagents: string[]
): { willReact: boolean; reaction: ReactionRule | null; message: string } {
  const reaction = findReaction(selectedReagents)
  
  if (reaction) {
    return {
      willReact: true,
      reaction,
      message: `检测到反应：${reaction.name} - ${reaction.description}`,
    }
  }
  
  return {
    willReact: false,
    reaction: null,
    message: '当前试剂组合不会发生明显反应',
  }
}

// Helper function to get reaction phenomena
export function getReactionPhenomena(
  selectedReagents: string[]
): string[] {
  const reaction = findReaction(selectedReagents)
  if (!reaction) return []
  
  return reaction.phenomena.map(p => p.description)
}
