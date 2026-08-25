import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Shield, Info, CheckSquare, Square } from 'lucide-react'
import type { SafetyAlert, RiskLevel } from './safetyRules'

interface SafetyAlertPanelProps {
  /** 当前生效的预警列表（由 useSafetyGuard 评估得到）。 */
  alerts: SafetyAlert[]
  /** 是否存在阻断性（danger）预警。 */
  hasBlocking: boolean
  /** 已勾选「已阅读并理解」的 warning 预警 id 集合。 */
  acknowledgedIds: Set<string>
  /** 勾选 / 取消 warning 级「已阅读并理解」。 */
  onToggleAcknowledge: (alertId: string) => void
  /** 忽略 info 级预警。 */
  onDismiss: (alertId: string) => void
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

/**
 * 受控预警面板：只负责按等级渲染与交互，评估与放行判定由 useSafetyGuard 收敛。
 * - danger：不可关闭、不可忽略（对应操作按钮由页面禁用）。
 * - warning：提供「已阅读并理解」勾选，勾选后由 hook 放行。
 * - info：可忽略。
 */
export default function SafetyAlertPanel({
  alerts,
  hasBlocking,
  acknowledgedIds,
  onToggleAcknowledge,
  onDismiss,
}: SafetyAlertPanelProps) {
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

  return (
    <div className="space-y-3">
      {/* Summary Banner */}
      {hasBlocking && (
        <div className="bg-danger-light border-2 border-danger rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0" />
          <div className="text-danger-dark">
            <p className="font-bold">⚠️ 存在危险操作，请先处理安全警告</p>
            <p className="text-sm">相关操作已被阻断，请按照安全建议修改后再继续</p>
          </div>
        </div>
      )}

      {/* Alert List */}
      <AnimatePresence>
        {alerts.map((alert) => {
          const config = riskConfig[alert.riskLevel]
          const acknowledged = acknowledgedIds.has(alert.id)

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

                  {/* warning 级需学生勾选「已阅读并理解」后放行 */}
                  {alert.riskLevel === 'warning' && (
                    <button
                      type="button"
                      onClick={() => onToggleAcknowledge(alert.id)}
                      className={`mt-3 inline-flex items-center gap-2 text-sm font-medium ${config.color} hover:opacity-80 transition-opacity`}
                    >
                      {acknowledged ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      已阅读并理解
                    </button>
                  )}
                </div>

                {/* info 可忽略；danger / warning 不提供关闭 */}
                {alert.riskLevel === 'info' && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className={`flex-shrink-0 p-1 rounded-lg ${config.color} hover:bg-white/50 transition-colors`}
                    aria-label="忽略提示"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
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
