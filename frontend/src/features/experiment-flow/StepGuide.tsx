import { motion } from 'framer-motion'
import type { ExperimentStep, StepStatus } from '../../types/experiment'
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Play
} from 'lucide-react'

interface StepGuideProps {
  steps: ExperimentStep[]
  currentStepIndex: number
  onNext: () => void
  onPrev: () => void
  canProceed: boolean
  canGoBack: boolean
  isComplete: boolean
}

const statusConfig: Record<StepStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
  locked: {
    icon: <Lock className="w-4 h-4" />,
    color: 'text-slate-400',
    bgColor: 'bg-slate-100',
  },
  available: {
    icon: <Circle className="w-4 h-4" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  active: {
    icon: <Play className="w-4 h-4" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
  },
  completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-success',
    bgColor: 'bg-success-light',
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-danger',
    bgColor: 'bg-danger-light',
  },
}

export default function StepGuide({
  steps,
  currentStepIndex,
  onNext,
  onPrev,
  canProceed,
  canGoBack,
  isComplete,
}: StepGuideProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-900">实验步骤</h3>
      </div>

      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-500">进度</span>
            <span className="font-medium text-slate-900">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {steps.map((step, index) => {
            const config = statusConfig[step.status]
            const isCurrent = index === currentStepIndex

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? 'border-primary-500 bg-primary-50'
                    : step.status === 'completed'
                    ? 'border-success bg-success-light'
                    : step.status === 'locked'
                    ? 'border-slate-100 bg-slate-50 opacity-60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor} ${config.color}`}
                  >
                    {config.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">步骤 {step.order}</span>
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 bg-primary-500 text-white rounded-full">
                          当前
                        </span>
                      )}
                    </div>
                    
                    <h4 className={`font-semibold mt-1 ${
                      isCurrent ? 'text-primary-900' : 'text-slate-900'
                    }`}>
                      {step.title}
                    </h4>
                    
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>

                    {isCurrent && step.safetyTips.length > 0 && (
                      <div className="mt-3 p-2 bg-warning-light rounded-lg">
                        <p className="text-xs text-warning-dark">
                          <span className="font-semibold">安全提示: </span>
                          {step.safetyTips.join('；')}
                        </p>
                      </div>
                    )}

                    {isCurrent && step.expectedPhenomena.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold">预期现象: </span>
                          {step.expectedPhenomena.join('，')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={onPrev}
            disabled={!canGoBack}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>

          {isComplete ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              实验完成
            </div>
          ) : (
            <button
              onClick={onNext}
              disabled={!canProceed}
              className="flex items-center gap-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStepIndex === steps.length - 1 ? '完成实验' : '下一步'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
