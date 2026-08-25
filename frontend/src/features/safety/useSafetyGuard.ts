import { useCallback, useEffect, useMemo, useState } from 'react'
import { checkSafety, type SafetyAlert } from './safetyRules'
import { useUIStore } from '../../store'

interface UseSafetyGuardProps {
  selectedInstruments: string[]
  selectedReagents: string[]
  currentStepId?: string
}

export interface UseSafetyGuardReturn {
  alerts: SafetyAlert[]
  hasDanger: boolean
  canProceed: boolean
  acknowledgedIds: Set<string>
  purityVerified: boolean
  ignited: boolean
  acknowledgeAlert: (ruleId: string) => void
  dismissAlert: (ruleId: string) => void
  verifyPurity: () => void
  attemptIgnition: () => void
  resetSafety: () => void
}

const HYDROGEN_ACID_REAGENT_IDS = ['h2so4-dilute', 'hcl-dilute']

export function hasHydrogenSource(selectedReagents: string[]): boolean {
  return (
    selectedReagents.includes('zinc') &&
    HYDROGEN_ACID_REAGENT_IDS.some((id) => selectedReagents.includes(id))
  )
}

export function useSafetyGuard({
  selectedInstruments,
  selectedReagents,
  currentStepId,
}: UseSafetyGuardProps): UseSafetyGuardReturn {
  const { addToast } = useUIStore()

  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [ignitionAttempted, setIgnitionAttempted] = useState(false)
  const [purityVerified, setPurityVerified] = useState(false)
  const [ignited, setIgnited] = useState(false)

  useEffect(() => {
    setAcknowledgedIds(new Set())
    setDismissedIds(new Set())
  }, [currentStepId])

  const context = useMemo(
    () => ({
      selectedInstruments,
      selectedReagents,
      currentStepId,
      action: ignitionAttempted ? ('ignite' as const) : undefined,
      purityVerified,
    }),
    [selectedInstruments, selectedReagents, currentStepId, ignitionAttempted, purityVerified]
  )

  const alerts = useMemo(() => {
    const evaluated = checkSafety(context)
    return evaluated.filter((alert) => !dismissedIds.has(alert.ruleId))
  }, [context, dismissedIds])

  const hasDanger = useMemo(
    () => alerts.some((alert) => alert.riskLevel === 'danger'),
    [alerts]
  )

  const hasUnacknowledgedWarning = useMemo(
    () =>
      alerts.some(
        (alert) => alert.riskLevel === 'warning' && !acknowledgedIds.has(alert.ruleId)
      ),
    [alerts, acknowledgedIds]
  )

  const canProceed = !hasDanger && !hasUnacknowledgedWarning

  const acknowledgeAlert = useCallback((ruleId: string) => {
    setAcknowledgedIds((prev) => new Set(prev).add(ruleId))
  }, [])

  const dismissAlert = useCallback((ruleId: string) => {
    setDismissedIds((prev) => new Set(prev).add(ruleId))
  }, [])

  const verifyPurity = useCallback(() => {
    setPurityVerified(true)
    addToast({
      type: 'success',
      title: '验纯完成',
      message: '听到轻微的"噗"声，氢气已纯净，可以安全点燃',
    })
  }, [addToast])

  const attemptIgnition = useCallback(() => {
    setIgnitionAttempted(true)
    if (purityVerified) {
      setIgnited(true)
      addToast({
        type: 'success',
        title: '氢气已点燃',
        message: '气体纯净，氢气安静燃烧，产生淡蓝色火焰',
      })
    } else {
      addToast({
        type: 'error',
        title: '危险操作已阻断',
        message: '未验纯就点燃氢气存在爆炸风险，请先完成验纯',
      })
    }
  }, [purityVerified, addToast])

  const resetSafety = useCallback(() => {
    setAcknowledgedIds(new Set())
    setDismissedIds(new Set())
    setIgnitionAttempted(false)
    setPurityVerified(false)
    setIgnited(false)
  }, [])

  return {
    alerts,
    hasDanger,
    canProceed,
    acknowledgedIds,
    purityVerified,
    ignited,
    acknowledgeAlert,
    dismissAlert,
    verifyPurity,
    attemptIgnition,
    resetSafety,
  }
}
