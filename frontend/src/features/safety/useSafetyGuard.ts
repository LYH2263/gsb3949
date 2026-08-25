import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RiskLevel, SafetyAlert, SafetyContext } from './safetyRules'
import { checkSafety, getHighestRiskLevel } from './safetyRules'

interface UseSafetyGuardProps {
  selectedInstruments: string[]
  selectedReagents: string[]
  currentStepId?: string
}

interface UseSafetyGuardReturn {
  /** 当前生效的预警列表（已附带确认/忽略状态）。 */
  alerts: SafetyAlert[]
  /** 最高风险等级。 */
  highestRiskLevel: RiskLevel
  /** 是否存在阻断性（danger）预警。 */
  hasBlocking: boolean
  /**
   * 当前步骤是否允许点击「下一步 / 完成实验」。
   * danger 阻断 → 禁止；warning 需勾选「已阅读并理解」后放行；info 不阻断。
   */
  canProceed: boolean
  /** 已勾选「已阅读并理解」的预警 id 集合（仅当前步骤有效）。 */
  acknowledgedIds: Set<string>
  /** 已忽略的 info 预警 id 集合（仅当前步骤有效）。 */
  dismissedIds: Set<string>
  /** 勾选 / 取消勾选 warning 级预警的「已阅读并理解」。 */
  toggleAcknowledge: (alertId: string) => void
  /** 忽略 info 级预警。 */
  dismissAlert: (alertId: string) => void
  /**
   * 触发一次操作类判定（如点燃/验纯）。仅在学生真正点击时调用，
   * 从而让 requiresAction 类规则（氢气验纯）在此刻判定，避免选试剂即误报。
   */
  triggerAction: (action: string) => SafetyAlert[]
  /** 标记已完成验纯，清除未验纯类阻断。 */
  markPurityVerified: () => void
  /** 清空当前操作态（不影响器材/试剂选择）。 */
  clearAction: () => void
}

/**
 * 安全评估与放行判定的独立收敛点。
 *
 * - 器材/试剂选择或步骤切换时实时刷新被动预警。
 * - 操作类风险（点燃/验纯、稀释）仅在学生触发对应操作时判定。
 * - 确认（warning）与忽略（info）状态仅对当前步骤有效，切步后自动清空。
 */
export function useSafetyGuard({
  selectedInstruments,
  selectedReagents,
  currentStepId,
}: UseSafetyGuardProps): UseSafetyGuardReturn {
  // 当前触发的操作（如 'ignite'），仅选择试剂时为空。
  const [action, setAction] = useState<string | undefined>(undefined)
  const [purityVerified, setPurityVerified] = useState(false)
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  // 步骤切换时重置确认/忽略与操作态：确认状态只对当前步骤有效。
  const prevStepRef = useRef<string | undefined>(currentStepId)
  useEffect(() => {
    if (prevStepRef.current !== currentStepId) {
      prevStepRef.current = currentStepId
      setAction(undefined)
      setPurityVerified(false)
      setAcknowledgedIds(new Set())
      setDismissedIds(new Set())
    }
  }, [currentStepId])

  const buildContext = useCallback(
    (overrideAction?: string): SafetyContext => ({
      selectedInstruments,
      selectedReagents,
      currentStepId,
      action: overrideAction ?? action,
      purityVerified,
    }),
    [selectedInstruments, selectedReagents, currentStepId, action, purityVerified]
  )

  // 被动 + 操作态实时评估。器材/试剂/步骤/操作/验纯变化都会重新计算。
  const rawAlerts = useMemo(
    () => checkSafety(buildContext()),
    [buildContext]
  )

  // 附带前端交互状态，并过滤掉已忽略的 info 预警。
  const alerts = useMemo(
    () =>
      rawAlerts.filter(
        (a) => !(a.riskLevel === 'info' && dismissedIds.has(a.id))
      ),
    [rawAlerts, dismissedIds]
  )

  const highestRiskLevel = useMemo(() => getHighestRiskLevel(alerts), [alerts])

  const hasBlocking = useMemo(
    () => alerts.some((a) => a.blocking || a.riskLevel === 'danger'),
    [alerts]
  )

  // 放行判定：danger 一律阻断；未确认的 warning 阻断；info 不阻断。
  const canProceed = useMemo(() => {
    if (hasBlocking) return false
    const unresolvedWarning = alerts.some(
      (a) => a.riskLevel === 'warning' && !acknowledgedIds.has(a.id)
    )
    return !unresolvedWarning
  }, [alerts, hasBlocking, acknowledgedIds])

  const toggleAcknowledge = useCallback((alertId: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev)
      if (next.has(alertId)) {
        next.delete(alertId)
      } else {
        next.add(alertId)
      }
      return next
    })
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    setDismissedIds((prev) => new Set(prev).add(alertId))
  }, [])

  const triggerAction = useCallback(
    (nextAction: string): SafetyAlert[] => {
      setAction(nextAction)
      return checkSafety(buildContext(nextAction))
    },
    [buildContext]
  )

  const markPurityVerified = useCallback(() => {
    setPurityVerified(true)
  }, [])

  const clearAction = useCallback(() => {
    setAction(undefined)
  }, [])

  return {
    alerts,
    highestRiskLevel,
    hasBlocking,
    canProceed,
    acknowledgedIds,
    dismissedIds,
    toggleAcknowledge,
    dismissAlert,
    triggerAction,
    markPurityVerified,
    clearAction,
  }
}
