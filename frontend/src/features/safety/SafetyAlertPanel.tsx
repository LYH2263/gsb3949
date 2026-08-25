import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Shield, Info } from 'lucide-react'
import type { SafetyAlert, RiskLevel } from './safetyRules'
import { checkSafety, hasBlockingAlert } from './safetyRules'

interface SafetyAlertPanelProps {
  selectedInstruments?: string[]
  selectedReagents?: string[]
  currentStepId?: string
  onAlertChange?: (alerts: SafetyAlert[]) => void
  /** 受控模式：由 useSafetyGuard 传入评估结果，面板不再内部计算 */
  alerts?: SafetyAlert[]
  /** 受控模式：warning 级警告的勾选确认状态与回调 */
  warningsAcknowledged?: boolean
  onAcknowledgeWarnings?: (acknowledged: boolean) => void
}

const riskConfig: Record<RiskLevel, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
  danger: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-danger',
    bgColor: 'bg-danger-light',
    borderColor: 'border-danger',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-warning',
    bgColor: 'bg-warning-light',
    borderColor: 'border-warning',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
}

export default function SafetyAlertPanel({
  selectedInstruments,
  selectedReagents,
  currentStepId,
  onAlertChange,
  alerts: controlledAlerts,
  warningsAcknowledged = false,
  onAcknowledgeWarnings,
}: SafetyAlertPanelProps) {
  const isControlled = controlledAlerts !== undefined
  const [internalAlerts, setInternalAlerts] = useState<SafetyAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isControlled) return

    const context = {
      selectedInstruments: selectedInstruments ?? [],
      selectedReagents: selectedReagents ?? [],
      currentStepId,
    }

    const newAlerts = checkSafety(context)
    const filteredAlerts = newAlerts.filter(a => !dismissedAlerts.has(a.id))

    setInternalAlerts(filteredAlerts)

    if (onAlertChange) {
      onAlertChange(filteredAlerts)
    }
  }, [isControlled, selectedInstruments, selectedReagents, currentStepId, dismissedAlerts, onAlertChange])

  const alerts = isControlled
    ? controlledAlerts.filter(a => !dismissedAlerts.has(a.id))
    : internalAlerts

  const warningAlerts = alerts.filter(a => a.riskLevel === 'warning')
  // warning 级需勾选确认后才放行，确认前不允许关闭
  const requireAcknowledgment = isControlled && onAcknowledgeWarnings !== undefined

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-success-light border border-success rounded-xl p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-success" />
        <div className="text-sm text-success-dark">
          <p className="font-semibold">安全状态良好</p>
          <p>当前操作符合安全规范</p>
        </div>
      </div>
    )
  }

  const hasBlocking = hasBlockingAlert(alerts)

  return (
    <div className="space-y-3">
      {/* Summary Banner */}
      {hasBlocking && (
        <div className="bg-danger-light border-2 border-danger rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0" />
          <div className="text-danger-dark">
            <p className="font-bold">⚠️ 存在危险操作，请先处理安全警告</p>
            <p className="text-sm">部分操作被阻断，请按照安全建议修改后再继续</p>
          </div>
        </div>
      )}

      {/* Alert List */}
      <AnimatePresence>
        {alerts.map((alert) => {
          const config = riskConfig[alert.riskLevel]
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl p-4 relative`}
            >
              <div className="flex items-start gap-3">
                <div className={`${config.color} flex-shrink-0 mt-0.5`}>
                  {config.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      alert.riskLevel === 'danger' 
                        ? 'bg-danger text-white' 
                        : alert.riskLevel === 'warning'
                        ? 'bg-warning text-white'
                        : 'bg-primary-100 text-primary-700'
                    }`}>
                      {alert.riskLevel === 'danger' ? '高危' : alert.riskLevel === 'warning' ? '警告' : '提示'}
                      {alert.blocking && ' · 阻断'}
                    </span>
                  </div>
                  
                  <p className={`font-semibold ${config.color} mb-1`}>
                    {alert.message}
                  </p>
                  
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">建议: </span>
                    {alert.suggestion}
                  </p>
                </div>

                {!alert.blocking && !(requireAcknowledgment && alert.riskLevel === 'warning') && (
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className={`flex-shrink-0 p-1 rounded-lg ${config.color} hover:bg-white/50 transition-colors`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Warning 级确认：勾选「已阅读并理解」后才放行 */}
      {requireAcknowledgment && warningAlerts.length > 0 && (
        <label className="flex items-center gap-2 px-4 py-3 bg-warning-light border border-warning rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={warningsAcknowledged}
            onChange={(e) => onAcknowledgeWarnings?.(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-sm font-medium text-warning-dark">
            已阅读并理解上述安全警告
          </span>
        </label>
      )}
    </div>
  )
}

// Compact version for inline display
export function SafetyAlertBadge({ count, riskLevel }: { count: number; riskLevel: RiskLevel }) {
  if (count === 0) return null

  const config = riskConfig[riskLevel]
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} ${config.borderColor} border`}
    >
      {config.icon}
      <span>{count} 个{riskLevel === 'danger' ? '危险' : riskLevel === 'warning' ? '警告' : '提示'}</span>
    </motion.div>
  )
}
