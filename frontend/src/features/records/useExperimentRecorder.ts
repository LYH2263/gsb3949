import { useState, useCallback, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ExperimentRecord, type StepRecord, saveExperimentRecord, getExperimentStats } from '../../storage/db'

interface UseExperimentRecorderProps {
  experimentId: string
  experimentName: string
  category: string
}

interface UseExperimentRecorderReturn {
  isRecording: boolean
  startTime: Date | null
  steps: StepRecord[]
  currentStepIndex: number
  startRecording: () => void
  completeStep: (stepName: string, phenomena?: string[]) => void
  stopRecording: (success: boolean, conclusion: string) => Promise<number | null>
  addDataPoint: (type: 'temperature' | 'ph' | 'volume' | 'time' | 'observation', value: number | string, unit?: string, description?: string) => void
}

export function useExperimentRecorder({
  experimentId,
  experimentName,
  category,
}: UseExperimentRecorderProps): UseExperimentRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [steps, setSteps] = useState<StepRecord[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [dataPoints, setDataPoints] = useState<ExperimentRecord['dataPoints']>([])

  const startRecording = useCallback(() => {
    setIsRecording(true)
    setStartTime(new Date())
    setSteps([])
    setCurrentStepIndex(-1)
    setDataPoints([])
  }, [])

  const completeStep = useCallback((stepName: string, phenomena?: string[]) => {
    const now = new Date()
    
    setSteps(prev => {
      // Check if step already exists
      const existingIndex = prev.findIndex(s => s.stepName === stepName)
      
      if (existingIndex >= 0) {
        // Update existing step
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          endTime: now,
          duration: (now.getTime() - updated[existingIndex].startTime.getTime()) / 1000,
          completed: true,
          phenomena: phenomena || updated[existingIndex].phenomena,
        }
        return updated
      } else {
        // Add new step
        return [...prev, {
          stepId: `step-${Date.now()}`,
          stepName,
          startTime: now,
          endTime: now,
          duration: 0,
          completed: true,
          phenomena,
        }]
      }
    })
    
    setCurrentStepIndex(prev => prev + 1)
  }, [])

  const addDataPoint = useCallback((
    type: 'temperature' | 'ph' | 'volume' | 'time' | 'observation',
    value: number | string,
    unit?: string,
    description?: string
  ) => {
    setDataPoints((prev: ExperimentRecord['dataPoints']) => [...prev, {
      timestamp: Date.now(),
      type,
      value,
      unit,
      description,
    }])
  }, [])

  const stopRecording = useCallback(async (
    success: boolean,
    conclusion: string
  ): Promise<number | null> => {
    if (!isRecording || !startTime) return null

    const endTime = new Date()
    const duration = (endTime.getTime() - startTime.getTime()) / 1000

    const record: Omit<ExperimentRecord, 'id'> = {
      experimentId,
      experimentName,
      category,
      startTime,
      endTime,
      duration,
      steps,
      selectedInstruments: [], // Will be filled by caller
      selectedReagents: [], // Will be filled by caller
      phenomena: steps.flatMap(s => s.phenomena || []),
      result: {
        success,
        completedSteps: steps.filter(s => s.completed).length,
        totalSteps: steps.length,
        conclusion,
      },
      dataPoints,
    }

    const id = await saveExperimentRecord(record)
    
    // Reset state
    setIsRecording(false)
    setStartTime(null)
    setSteps([])
    setCurrentStepIndex(-1)
    setDataPoints([])
    
    return id
  }, [isRecording, startTime, experimentId, experimentName, category, steps, dataPoints])

  return {
    isRecording,
    startTime,
    steps,
    currentStepIndex,
    startRecording,
    completeStep,
    stopRecording,
    addDataPoint,
  }
}

// Hook for fetching all records
export function useExperimentRecords() {
  const records = useLiveQuery(() => db.records.orderBy('startTime').reverse().toArray(), [])
  
  return {
    records: records || [],
    isLoading: records === undefined,
  }
}

// Hook for fetching a single record
export function useExperimentRecord(id: number | null) {
  const record = useLiveQuery(
    () => id ? db.records.get(id) : undefined,
    [id]
  )
  
  return {
    record,
    isLoading: record === undefined && id !== null,
  }
}

// Hook for experiment statistics
export function useExperimentStatistics() {
  const [stats, setStats] = useState<{
    totalExperiments: number
    totalDuration: number
    successRate: number
    byCategory: Record<string, number>
  } | null>(null)
  
  useEffect(() => {
    getExperimentStats().then(setStats)
  }, [])
  
  return { stats, isLoading: stats === null }
}
