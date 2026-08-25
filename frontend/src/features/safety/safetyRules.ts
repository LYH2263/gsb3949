export type RiskLevel = 'info' | 'warning' | 'danger'

export interface SafetyRule {
  id: string
  name: string
  description: string
  riskLevel: RiskLevel
  trigger: {
    type: 'incompatible_reagents' | 'wrong_order' | 'missing_instrument' | 'wrong_heating' | 'excess_reagent' | 'ignition_without_purity_check'
    reagentIds?: string[]
    instrumentIds?: string[]
    condition?: (context: SafetyContext) => boolean
  }
  message: string
  suggestion: string
  blocking: boolean
}

export interface SafetyContext {
  selectedInstruments: string[]
  selectedReagents: string[]
  currentStepId?: string
  action?: string
  purityChecked?: boolean
}

export interface SafetyAlert {
  id: string
  ruleId: string
  riskLevel: RiskLevel
  message: string
  suggestion: string
  blocking: boolean
  timestamp: number
}

// 安全规则定义
export const safetyRules: SafetyRule[] = [
  {
    id: 'rule-1',
    name: '浓酸稀释顺序',
    description: '浓酸稀释时必须先加水后加酸',
    riskLevel: 'danger',
    trigger: {
      type: 'wrong_order',
      reagentIds: ['h2so4-dilute', 'hcl-dilute'],
      condition: (ctx) => ctx.action === 'dilute_acid',
    },
    message: '⚠️ 危险操作：稀释浓酸时顺序错误',
    suggestion: '稀释浓酸时必须将酸缓慢加入水中，并不断搅拌。绝对禁止将水倒入浓酸中！',
    blocking: true,
  },
  {
    id: 'rule-2',
    name: '加热试管方向',
    description: '加热液体时试管口不能对人',
    riskLevel: 'warning',
    trigger: {
      type: 'wrong_heating',
      instrumentIds: ['test-tube'],
    },
    message: '⚠️ 安全提醒：加热试管时管口不得对人',
    suggestion: '加热试管时应将管口朝向无人方向，防止液体喷溅伤人',
    blocking: false,
  },
  {
    id: 'rule-3',
    name: '氢气点燃前验纯',
    description: '点燃可燃气体前必须验纯',
    riskLevel: 'danger',
    trigger: {
      type: 'ignition_without_purity_check',
      reagentIds: ['zinc', 'h2so4-dilute'],
      condition: (ctx) => ctx.action === 'ignite' && !ctx.purityChecked,
    },
    message: '⚠️ 危险操作：未验纯就点燃氢气',
    suggestion: '点燃氢气前必须先检验纯度，防止爆炸。收集一小试管气体，靠近火焰听声音',
    blocking: true,
  },
  {
    id: 'rule-4',
    name: '强酸强碱混合',
    description: '强酸强碱剧烈反应提醒',
    riskLevel: 'warning',
    trigger: {
      type: 'incompatible_reagents',
      reagentIds: ['hcl-dilute', 'naoh-solution'],
    },
    message: '⚠️ 注意：强酸强碱会发生剧烈中和反应',
    suggestion: '操作时要缓慢滴加，边加边搅拌，注意防护',
    blocking: false,
  },
  {
    id: 'rule-5',
    name: '试管加热方式',
    description: '未用试管夹直接加热试管',
    riskLevel: 'warning',
    trigger: {
      type: 'missing_instrument',
      instrumentIds: ['test-tube'],
    },
    message: '⚠️ 安全提醒：加热试管必须使用试管夹',
    suggestion: '请使用试管夹夹持试管，不要用手直接拿取加热中的试管',
    blocking: false,
  },
  {
    id: 'rule-6',
    name: '量筒加热警告',
    description: '量筒不能加热',
    riskLevel: 'info',
    trigger: {
      type: 'wrong_heating',
      instrumentIds: ['measuring-cylinder'],
    },
    message: 'ℹ️ 提示：量筒不能用于加热',
    suggestion: '量筒是量器，不耐热。如需加热请使用烧杯或试管',
    blocking: false,
  },
  {
    id: 'rule-7',
    name: '酒精灯熄灭方式',
    description: '酒精灯不能用嘴吹灭',
    riskLevel: 'warning',
    trigger: {
      type: 'wrong_order',
      instrumentIds: ['alcohol-lamp'],
    },
    message: '⚠️ 安全提醒：酒精灯严禁用嘴吹灭',
    suggestion: '熄灭酒精灯必须用灯帽盖灭，盖两次防止负压粘连',
    blocking: false,
  },
  {
    id: 'rule-8',
    name: '固体取用规范',
    description: '取用固体试剂规范提示',
    riskLevel: 'info',
    trigger: {
      type: 'missing_instrument',
    },
    message: 'ℹ️ 提示：取用固体药品要遵循"一横二送三竖立"',
    suggestion: '试管横放，药匙送药品到管底，然后竖立试管让药品滑落',
    blocking: false,
  },
]

// 安全检查函数
export function checkSafety(context: SafetyContext): SafetyAlert[] {
  const alerts: SafetyAlert[] = []

  for (const rule of safetyRules) {
    const triggered = checkRule(rule, context)

    if (triggered) {
      alerts.push({
        id: rule.id,
        ruleId: rule.id,
        riskLevel: rule.riskLevel,
        message: rule.message,
        suggestion: rule.suggestion,
        blocking: rule.blocking,
        timestamp: Date.now(),
      })
    }
  }

  return alerts
}

// 检查单个规则
function checkRule(rule: SafetyRule, context: SafetyContext): boolean {
  const { trigger } = rule

  if (trigger.condition && !trigger.condition(context)) {
    return false
  }

  switch (trigger.type) {
    case 'incompatible_reagents':
      if (trigger.reagentIds) {
        return trigger.reagentIds.every(id => context.selectedReagents.includes(id))
      }
      return false

    case 'wrong_order':
      if (trigger.reagentIds) {
        return trigger.reagentIds.some(id => context.selectedReagents.includes(id))
      }
      if (trigger.instrumentIds) {
        return trigger.instrumentIds.some(id => context.selectedInstruments.includes(id))
      }
      return false

    case 'missing_instrument':
      if (trigger.instrumentIds) {
        return trigger.instrumentIds.some(id =>
          context.selectedInstruments.includes(id)
        )
      }
      return false

    case 'wrong_heating':
      if (trigger.instrumentIds) {
        return trigger.instrumentIds.some(id =>
          context.selectedInstruments.includes(id)
        )
      }
      return false

    case 'ignition_without_purity_check':
      return (
        context.selectedReagents.includes('zinc') &&
        context.selectedReagents.some(id => id === 'h2so4-dilute' || id === 'hcl-dilute')
      )

    default:
      return false
  }
}

// 获取最高风险等级
export function getHighestRiskLevel(alerts: SafetyAlert[]): RiskLevel {
  if (alerts.some(a => a.riskLevel === 'danger')) return 'danger'
  if (alerts.some(a => a.riskLevel === 'warning')) return 'warning'
  return 'info'
}

// 是否有阻断性警告
export function hasBlockingAlert(alerts: SafetyAlert[]): boolean {
  return alerts.some(a => a.blocking)
}
