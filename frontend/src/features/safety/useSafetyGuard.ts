import { useCallback, useEffect, useMemo, useState } from 'react'
import { checkSafety, type SafetyAlert } from './safetyRules'

export type SafetyAction = 'ignite'

interface UseSafetyGuardOptions {
  selectedInstruments: string[]
  selectedReagents: string[]
  currentStepId?: string
}

interface UseSafetyGuardReturn {
  alerts: SafetyAlert[]
  dangerAlerts: SafetyAlert[]
  warningAlerts: SafetyAlert[]
  infoAlerts: SafetyAlert[]
  hasDanger: boolean
  hasWarning: boolean
  /** 当前是否允许点击下一步/完成实验 */
  canProceed: boolean
  /** warning 级警告是否已被学生勾选确认（仅当前步骤有效） */
  warningsAcknowledged: boolean
  acknowledgeWarnings: (acknowledged: boolean) => void
  /** 学生点击「验纯」 */
  verifyHydrogenPurity: () => void
  /** 学生点击「点燃」等动作时触发判定 */
  performAction: (action: SafetyAction) => void
  hydrogenPurityVerified: boolean
}

/** 是否已具备氢气发生装置（锌 + 稀酸），用于控制「点燃/验纯」按钮显示 */
export function hasHydrogenReactionSetup(selectedReagents: string[]): boolean {
  return (
    selectedReagents.includes('zinc') &&
    (selectedReagents.includes('h2so4-dilute') || selectedReagents.includes('hcl-dilute'))
  )
}

export function useSafetyGuard({
  selectedInstruments,
  selectedReagents,
  currentStepId,
}: UseSafetyGuardOptions): UseSafetyGuardReturn {
  const [lastAction, setLastAction] = useState<SafetyAction | null>(null)
  const [hydrogenPurityVerified, setHydrogenPurityVerified] = useState(false)
  const [warningsAcknowledged, setWarningsAcknowledged] = useState(false)

  // 确认状态只对当前步骤有效，切换步骤后需重新勾选
  useEffect(() => {
    setWarningsAcknowledged(false)
  }, [currentStepId])

  // 氢气发生装置被拆除后，验纯状态与动作判定一并重置
  useEffect(() => {
    if (!hasHydrogenReactionSetup(selectedReagents)) {
      setHydrogenPurityVerified(false)
      setLastAction(null)
    }
  }, [selectedReagents])

  // 选器材/试剂或切换步骤时即时重新评估
  const alerts = useMemo<SafetyAlert[]>(() => {
    const context = {
      selectedInstruments,
      selectedReagents,
      currentStepId,
      action: lastAction ?? undefined,
      hydrogenPurityVerified,
    }

    return checkSafety(context).map((alert) => ({
      ...alert,
      // 使用稳定 id，保证同一步骤内可关闭/去重
      id: `${alert.ruleId}-${currentStepId ?? 'no-step'}`,
    }))
  }, [selectedInstruments, selectedReagents, currentStepId, lastAction, hydrogenPurityVerified])

  const dangerAlerts = useMemo(() => alerts.filter((a) => a.riskLevel === 'danger'), [alerts])
  const warningAlerts = useMemo(() => alerts.filter((a) => a.riskLevel === 'warning'), [alerts])
  const infoAlerts = useMemo(() => alerts.filter((a) => a.riskLevel === 'info'), [alerts])

  const hasDanger = dangerAlerts.length > 0
  const hasWarning = warningAlerts.length > 0

  // danger 阻断且不可关闭；warning 需勾选「已阅读并理解」；info 可忽略
  const canProceed = !hasDanger && (!hasWarning || warningsAcknowledged)

  const acknowledgeWarnings = useCallback((acknowledged: boolean) => {
    setWarningsAcknowledged(acknowledged)
  }, [])

  const verifyHydrogenPurity = useCallback(() => {
    setHydrogenPurityVerified(true)
  }, [])

  const performAction = useCallback((action: SafetyAction) => {
    setLastAction(action)
  }, [])

  return {
    alerts,
    dangerAlerts,
    warningAlerts,
    infoAlerts,
    hasDanger,
    hasWarning,
    canProceed,
    warningsAcknowledged,
    acknowledgeWarnings,
    verifyHydrogenPurity,
    performAction,
    hydrogenPurityVerified,
  }
}
