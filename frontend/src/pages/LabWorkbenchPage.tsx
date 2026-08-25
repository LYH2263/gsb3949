import { useParams, Navigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { FlaskConical, Beaker, AlertTriangle, Play, RotateCcw, Flame, ShieldCheck } from 'lucide-react'
import InstrumentPanel from '../features/instruments/InstrumentPanel'
import ReagentPanel from '../features/reagents/ReagentPanel'
import StepGuide from '../features/experiment-flow/StepGuide'
import SafetyAlertPanel from '../features/safety/SafetyAlertPanel'
import { useSafetyGuard } from '../features/safety/useSafetyGuard'
import { useExperimentFlow } from '../features/experiment-flow/useExperimentFlow'
import { useBackendExperimentRecorder } from '../features/records/useBackendExperimentRecorder'
import { experimentStepsMap } from '../data/experimentSteps'
import type { Instrument } from '../types/instrument'
import type { Reagent } from '../types/reagent'
import { useUIStore } from '../store'
import { useAuthStore } from '../store/authStore'

export default function LabWorkbenchPage() {
  const { experimentId } = useParams()
  const { addToast } = useUIStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([])
  const [selectedReagents, setSelectedReagents] = useState<Reagent[]>([])
  const [isExperimentRunning, setIsExperimentRunning] = useState(false)

  const experimentSteps = useMemo(() => {
    if (!experimentId) return []
    return experimentStepsMap[experimentId] || []
  }, [experimentId])

  const experimentTitle = useMemo(() => {
    if (!experimentId) return '化学实验'
    const titleMap: Record<string, string> = {
      'acid-base-neutralization': '酸碱中和反应',
      'metal-acid-reaction': '金属与酸反应',
      'gas-preparation': '氧气制备',
    }
    return titleMap[experimentId] || experimentId
  }, [experimentId])

  const {
    currentStepIndex,
    steps,
    canProceed,
    canGoBack,
    isComplete,
    nextStep,
    prevStep,
    validateStep,
    resetFlow,
  } = useExperimentFlow({
    steps: experimentSteps,
    selectedInstruments: selectedInstruments.map((i) => i.id),
    selectedReagents: selectedReagents.map((r) => r.id),
  })

  const {
    isRecording,
    startRecording,
    completeStep,
    stopRecording,
  } = useBackendExperimentRecorder({
    experimentType: experimentId || 'unknown',
    title: experimentTitle,
    totalSteps: experimentSteps.length || 1,
  })

  // 安全评估与放行判定统一收敛到 useSafetyGuard，页面只负责接线。
  const currentStepId = steps[currentStepIndex]?.id
  const safety = useSafetyGuard({
    selectedInstruments: selectedInstruments.map((i) => i.id),
    selectedReagents: selectedReagents.map((r) => r.id),
    currentStepId,
  })

  // 综合放行：既满足步骤器材/试剂要求，又通过安全放行判定。
  const safeCanProceed = canProceed && safety.canProceed

  if (!experimentId) {
    return <Navigate to="/" />
  }

  if (experimentSteps.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">实验未找到</h1>
          <p className="text-slate-600">请返回首页选择其他实验</p>
        </div>
      </div>
    )
  }

  const handleSelectInstrument = (instrument: Instrument) => {
    setSelectedInstruments((prev) => [...prev, instrument])
    addToast({
      type: 'success',
      title: '器材已添加',
      message: `${instrument.name} 已添加到实验台`,
    })
  }

  const handleDeselectInstrument = (instrumentId: string) => {
    setSelectedInstruments((prev) => prev.filter((item) => item.id !== instrumentId))
  }

  const handleSelectReagent = (reagent: Reagent) => {
    setSelectedReagents((prev) => [...prev, reagent])
    addToast({
      type: 'success',
      title: '试剂已添加',
      message: `${reagent.name} (${reagent.formula}) 已添加到实验台`,
    })
  }

  const handleDeselectReagent = (reagentId: string) => {
    setSelectedReagents((prev) => prev.filter((item) => item.id !== reagentId))
  }

  const handleStartExperiment = async () => {
    if (selectedInstruments.length === 0) {
      addToast({
        type: 'warning',
        title: '请选择器材',
        message: '至少需要选择一件实验器材',
      })
      return
    }

    if (!isAuthenticated) {
      addToast({
        type: 'error',
        title: '请先登录',
        message: '登录后才能保存实验记录',
      })
      return
    }

    try {
      await startRecording()
    } catch {
      addToast({
        type: 'error',
        title: '记录初始化失败',
        message: '无法创建实验记录，请稍后重试',
      })
      return
    }

    setIsExperimentRunning(true)
    addToast({
      type: 'info',
      title: '实验开始',
      message: '请按照步骤引导完成实验',
    })
  }

  const handleReset = async () => {
    if (isRecording && !isComplete) {
      try {
        await stopRecording(false, '用户重置实验')
      } catch {
        // Keep reset available even if backend update fails.
      }
    }

    setSelectedInstruments([])
    setSelectedReagents([])
    setIsExperimentRunning(false)
    resetFlow()
    addToast({
      type: 'info',
      title: '已重置',
      message: '实验台已清空',
    })
  }

  const handleNextStep = async () => {
    const step = steps[currentStepIndex]
    if (!step) return

    if (!validateStep()) {
      return
    }

    // 安全放行判定：danger 阻断、warning 未确认时不放行。
    if (!safety.canProceed) {
      addToast({
        type: 'warning',
        title: '存在未处理的安全警告',
        message: '请先处理高危操作或勾选「已阅读并理解」后再继续',
      })
      return
    }

    const isLastStep = currentStepIndex === steps.length - 1

    if (isRecording) {
      try {
        await completeStep(step.title, {
          description: step.description,
          instruments: selectedInstruments.map((instrument) => instrument.id),
          reagents: selectedReagents.map((reagent) => ({ name: reagent.name })),
          observations: step.expectedPhenomena.join('；'),
        })
      } catch {
        addToast({
          type: 'error',
          title: '步骤保存失败',
          message: '请稍后重试',
        })
        return
      }
    }

    nextStep()

    if (isRecording && isLastStep) {
      try {
        await stopRecording(true, '实验完成')
      } catch {
        addToast({
          type: 'warning',
          title: '完成状态保存失败',
          message: '实验已完成，但记录状态未同步，请刷新记录页检查',
        })
      }
    }
  }

  const currentStep = steps[currentStepIndex]

  // 学生点击「点燃/验纯」时才判定氢气验纯类风险，仅选择试剂不触发。
  const handleIgnite = () => {
    const result = safety.triggerAction('ignite')
    const blocked = result.some((a) => a.blocking || a.riskLevel === 'danger')
    if (blocked) {
      addToast({
        type: 'error',
        title: '危险操作已拦截',
        message: '点燃前必须先验纯，请先完成氢气验纯',
      })
      return
    }
    addToast({
      type: 'success',
      title: '点燃成功',
      message: '氢气已安全点燃',
    })
  }

  const handleVerifyPurity = () => {
    safety.markPurityVerified()
    safety.clearAction()
    addToast({
      type: 'success',
      title: '验纯完成',
      message: '氢气已验纯，可安全点燃',
    })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-7 h-7 text-primary-600" />
                实验工作台
              </h1>
              <p className="text-slate-600 mt-1">选择器材和试剂，按照步骤引导完成实验</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
              <button
                onClick={handleStartExperiment}
                disabled={isExperimentRunning || selectedInstruments.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Play className="w-4 h-4" />
                开始实验
              </button>
            </div>
          </div>
        </div>

        <div className="bg-warning-light border border-warning rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm text-warning-dark">
            <p className="font-semibold mb-1">安全提示</p>
            <p>实验前请确保了解器材使用方式和试剂安全注意事项，按照步骤顺序操作，不要跳步。</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <InstrumentPanel
              selectedInstruments={selectedInstruments.map((i) => i.id)}
              onSelect={handleSelectInstrument}
              onDeselect={handleDeselectInstrument}
            />
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[500px]">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-primary-600" />
                  实验台
                </h3>
                {isExperimentRunning && (
                  <span className="text-sm text-primary-600 font-medium">实验进行中...</span>
                )}
              </div>

              <div className="p-6">
                {!isExperimentRunning ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Beaker className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">准备开始实验</h3>
                    <p className="text-slate-500 max-w-xs">选择器材和试剂后，点击“开始实验”按钮</p>
                  </div>
                ) : selectedInstruments.length === 0 && selectedReagents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Beaker className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">实验台为空</h3>
                    <p className="text-slate-500 max-w-xs">请从左侧选择器材，从右侧选择试剂</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isExperimentRunning && currentStep && (
                      <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-primary-500 text-white rounded-full">
                            当前步骤 {currentStep.order}
                          </span>
                        </div>
                        <h4 className="font-bold text-primary-900">{currentStep.title}</h4>
                        <p className="text-sm text-primary-700 mt-1">{currentStep.description}</p>
                      </div>
                    )}

                    {selectedInstruments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-500 mb-3">已选器材</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedInstruments.map((instrument) => (
                            <div
                              key={instrument.id}
                              className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200"
                            >
                              <span className="text-2xl">{instrument.icon}</span>
                              <div>
                                <p className="font-medium text-slate-900">{instrument.name}</p>
                                {instrument.capacity && (
                                  <p className="text-xs text-slate-500">{instrument.capacity}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeselectInstrument(instrument.id)}
                                className="ml-2 p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReagents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-500 mb-3">已选试剂</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedReagents.map((reagent) => (
                            <div
                              key={reagent.id}
                              className="flex items-center gap-2 px-4 py-3 bg-primary-50 rounded-xl border border-primary-200"
                            >
                              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-primary-600">
                                  {reagent.formula.slice(0, 3)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{reagent.name}</p>
                                <p className="text-xs text-slate-500 font-mono">{reagent.formula}</p>
                              </div>
                              <button
                                onClick={() => handleDeselectReagent(reagent.id)}
                                className="ml-2 p-1 hover:bg-primary-200 rounded-lg text-primary-400 hover:text-primary-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isComplete && (
                      <div className="mt-6 p-4 bg-success-light rounded-xl border border-success">
                        <p className="text-success-dark font-medium">实验完成</p>
                        <p className="text-sm text-success-dark/70 mt-1">所有步骤已完成，可前往实验记录查看。</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {isExperimentRunning && (
              <StepGuide
                steps={steps}
                currentStepIndex={currentStepIndex}
                onNext={handleNextStep}
                onPrev={prevStep}
                canProceed={safeCanProceed}
                canGoBack={canGoBack}
                isComplete={isComplete}
              />
            )}

            {/* 实时安全预警：选器材/试剂或切步时即时刷新，复用 SafetyAlertPanel */}
            {isExperimentRunning && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary-600" />
                    安全预警
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <SafetyAlertPanel
                    alerts={safety.alerts}
                    hasBlocking={safety.hasBlocking}
                    acknowledgedIds={safety.acknowledgedIds}
                    onToggleAcknowledge={safety.toggleAcknowledge}
                    onDismiss={safety.dismissAlert}
                  />

                  {/* 金属与酸实验：点燃/验纯为显式操作，仅点击时判定验纯风险 */}
                  {experimentId === 'metal-acid-reaction' && (
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleVerifyPurity}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        氢气验纯
                      </button>
                      <button
                        type="button"
                        onClick={handleIgnite}
                        className="flex items-center gap-1.5 px-4 py-2 bg-warning text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Flame className="w-4 h-4" />
                        点燃
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <ReagentPanel
              selectedReagents={selectedReagents.map((r) => ({
                id: r.id,
                name: r.name,
                formula: r.formula,
              }))}
              onSelect={handleSelectReagent}
              onDeselect={handleDeselectReagent}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
