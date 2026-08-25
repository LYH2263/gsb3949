import { useState, useCallback, useEffect } from 'react'
import type { ExperimentStep, StepStatus } from '../../types/experiment'
import { useUIStore } from '../../store'

interface UseExperimentFlowProps {
  steps: ExperimentStep[]
  selectedInstruments: string[]
  selectedReagents: string[]
}

interface UseExperimentFlowReturn {
  currentStepIndex: number
  steps: ExperimentStep[]
  canProceed: boolean
  canGoBack: boolean
  isComplete: boolean
  nextStep: () => void
  prevStep: () => void
  validateStep: () => boolean
  resetFlow: () => void
  getStepStatus: (stepId: string) => StepStatus
}

export function useExperimentFlow({
  steps: initialSteps,
  selectedInstruments,
  selectedReagents,
}: UseExperimentFlowProps): UseExperimentFlowReturn {
  const [steps, setSteps] = useState<ExperimentStep[]>(initialSteps)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [experimentComplete, setExperimentComplete] = useState(false)
  const { addToast } = useUIStore()

  // Update steps status based on current index
  useEffect(() => {
    setSteps(prevSteps => 
      prevSteps.map((step, index) => {
        if (index < currentStepIndex) {
          return { ...step, status: 'completed' }
        } else if (index === currentStepIndex) {
          return { ...step, status: 'available' }
        } else {
          return { ...step, status: 'locked' }
        }
      })
    )
  }, [currentStepIndex])

  const checkStepRequirements = useCallback(
    (step: ExperimentStep | undefined) => {
      if (!step) {
        return {
          isValid: false,
          missingInstruments: [] as string[],
          missingReagents: [] as string[],
        }
      }

      const missingInstruments = step.requiredInstruments.filter(
        (id: string) => !selectedInstruments.includes(id)
      )
      const missingReagents = step.requiredReagents.filter(
        (id: string) => !selectedReagents.includes(id)
      )

      return {
        isValid: missingInstruments.length === 0 && missingReagents.length === 0,
        missingInstruments,
        missingReagents,
      }
    },
    [selectedInstruments, selectedReagents]
  )

  const validateStep = useCallback((): boolean => {
    const currentStep = steps[currentStepIndex]
    if (!currentStep) return false
    const { isValid, missingInstruments, missingReagents } = checkStepRequirements(currentStep)

    if (missingInstruments.length > 0) {
      addToast({
        type: 'warning',
        title: '器材未就位',
        message: `请先选择: ${missingInstruments.join(', ')}`,
      })
      return false
    }

    if (missingReagents.length > 0) {
      addToast({
        type: 'warning',
        title: '试剂未添加',
        message: `请先添加: ${missingReagents.join(', ')}`,
      })
      return false
    }

    return isValid
  }, [steps, currentStepIndex, checkStepRequirements, addToast])

  const nextStep = useCallback(() => {
    if (!validateStep()) {
      return
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
      addToast({
        type: 'success',
        title: '步骤完成',
        message: `已完成: ${steps[currentStepIndex].title}`,
      })
    } else {
      // Complete
      setSteps(prevSteps =>
        prevSteps.map((step, index) =>
          index === currentStepIndex ? { ...step, status: 'completed' } : step
        )
      )
      setExperimentComplete(true)
      addToast({
        type: 'success',
        title: '实验完成',
        message: '恭喜！所有步骤已完成',
      })
    }
  }, [currentStepIndex, steps, validateStep, addToast])

  const prevStep = useCallback(() => {
    if (experimentComplete) {
      setExperimentComplete(false)
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
      setSteps(prevSteps => 
        prevSteps.map((step, index) => {
          if (index === currentStepIndex) {
            return { ...step, status: 'available' }
          }
          return step
        })
      )
    }
  }, [currentStepIndex, experimentComplete])

  const resetFlow = useCallback(() => {
    setCurrentStepIndex(0)
    setSteps(initialSteps)
    setExperimentComplete(false)
  }, [initialSteps])

  const getStepStatus = useCallback((stepId: string): StepStatus => {
    const step = steps.find(s => s.id === stepId)
    return step?.status || 'locked'
  }, [steps])

  const currentStep = steps[currentStepIndex]
  const canProceed = !experimentComplete && checkStepRequirements(currentStep).isValid
  const canGoBack = currentStepIndex > 0
  const isComplete = experimentComplete

  return {
    currentStepIndex,
    steps,
    canProceed,
    canGoBack,
    isComplete,
    nextStep,
    prevStep,
    validateStep,
    resetFlow,
    getStepStatus,
  }
}
