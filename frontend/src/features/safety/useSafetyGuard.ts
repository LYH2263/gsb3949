import { useState, useMemo, useEffect, useCallback } from 'react'
import { checkSafety, hasBlockingAlert } from './safetyRules'
import type { SafetyAlert, SafetyContext } from './safetyRules'

interface UseSafetyGuardProps {
  selectedInstruments: string[]
  selectedReagents: string[]
  currentStepId?: string
}

interface UseSafetyGuardReturn {
  alerts: SafetyAlert[]
  visibleAlerts: SafetyAlert[]
  canProceed: boolean
  hasDanger: boolean
  hasBlocking: boolean
  acknowledgedWarnings: Set<string>
  dismissedInfos: Set<string>
  isWarningAcknowledged: (alertId: string) => boolean
  isInfoDismissed: (alertId: string) => boolean
  acknowledgeWarning: (alertId: string) => void
  dismissInfo: (alertId: string) => void
  performAction: (action: string) => void
  clearAction: () => void
  markPurityChecked: () => void
  isPurityChecked: boolean
  isHydrogenScene: boolean
  resetSafety: () => void
}

export function useSafetyGuard({
  selectedInstruments,
  selectedReagents,
  currentStepId,
}: UseSafetyGuardProps): UseSafetyGuardReturn {
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState<Set<string>>(new Set())
  const [dismissedInfos, setDismissedInfos] = useState<Set<string>>(new Set())
  const [action, setAction] = useState<string | undefined>(undefined)
  const [purityChecked, setPurityChecked] = useState(false)

  useEffect(() => {
    setAcknowledgedWarnings(new Set())
    setDismissedInfos(new Set())
    setAction(undefined)
    setPurityChecked(false)
  }, [currentStepId])

  const context: SafetyContext = useMemo(
    () => ({
      selectedInstruments,
      selectedReagents,
      currentStepId,
      action,
      purityChecked,
    }),
    [selectedInstruments, selectedReagents, currentStepId, action, purityChecked]
  )

  const alerts = useMemo(() => checkSafety(context), [context])

  const isHydrogenScene = useMemo(
    () =>
      selectedReagents.includes('zinc') &&
      selectedReagents.some((id) => id === 'h2so4-dilute' || id === 'hcl-dilute'),
    [selectedReagents]
  )

  const visibleAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (alert.riskLevel === 'info') {
        return !dismissedInfos.has(alert.id)
      }
      return true
    })
  }, [alerts, dismissedInfos])

  const hasDanger = useMemo(
    () => alerts.some((alert) => alert.riskLevel === 'danger'),
    [alerts]
  )

  const hasBlocking = useMemo(() => hasBlockingAlert(alerts), [alerts])

  const allWarningsAcknowledged = useMemo(() => {
    const warningAlerts = alerts.filter((alert) => alert.riskLevel === 'warning')
    return warningAlerts.every((alert) => acknowledgedWarnings.has(alert.id))
  }, [alerts, acknowledgedWarnings])

  const canProceed = useMemo(() => {
    if (hasDanger || hasBlocking) return false
    if (!allWarningsAcknowledged) return false
    return true
  }, [hasDanger, hasBlocking, allWarningsAcknowledged])

  const acknowledgeWarning = useCallback((alertId: string) => {
    setAcknowledgedWarnings((prev) => {
      const next = new Set(prev)
      next.add(alertId)
      return next
    })
  }, [])

  const dismissInfo = useCallback((alertId: string) => {
    setDismissedInfos((prev) => {
      const next = new Set(prev)
      next.add(alertId)
      return next
    })
  }, [])

  const performAction = useCallback((act: string) => {
    setAction(act)
  }, [])

  const clearAction = useCallback(() => {
    setAction(undefined)
  }, [])

  const markPurityChecked = useCallback(() => {
    setPurityChecked(true)
    setAction(undefined)
  }, [])

  const resetSafety = useCallback(() => {
    setAcknowledgedWarnings(new Set())
    setDismissedInfos(new Set())
    setAction(undefined)
    setPurityChecked(false)
  }, [])

  return {
    alerts,
    visibleAlerts,
    canProceed,
    hasDanger,
    hasBlocking,
    acknowledgedWarnings,
    dismissedInfos,
    isWarningAcknowledged: (alertId) => acknowledgedWarnings.has(alertId),
    isInfoDismissed: (alertId) => dismissedInfos.has(alertId),
    acknowledgeWarning,
    dismissInfo,
    performAction,
    clearAction,
    markPurityChecked,
    isPurityChecked: purityChecked,
    isHydrogenScene,
    resetSafety,
  }
}
