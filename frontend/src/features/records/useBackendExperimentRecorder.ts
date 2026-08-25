import { useState, useCallback, useEffect } from 'react'
import { experimentApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export interface BackendStepRecord {
  id: number
  step_number: number
  step_name: string
  description?: string
  instruments_used: string[]
  reagents_used: Array<{ name: string; amount?: string }>
  observations?: string
  completed_at: string
}

export interface BackendExperimentRecord {
  id: number
  user_id: number
  experiment_type: string
  title: string
  status: 'in_progress' | 'completed' | 'failed'
  steps_completed: number
  total_steps: number
  data: Record<string, unknown>
  notes?: string
  started_at: string
  completed_at?: string
  created_at: string
  updated_at?: string
  steps: BackendStepRecord[]
}

interface UseBackendExperimentRecorderProps {
  experimentType: string
  title: string
  totalSteps: number
}

interface UseBackendExperimentRecorderReturn {
  isRecording: boolean
  isLoading: boolean
  currentExperiment: BackendExperimentRecord | null
  startTime: Date | null
  steps: BackendStepRecord[]
  currentStepIndex: number
  startRecording: () => Promise<void>
  completeStep: (stepName: string, data?: {
    description?: string
    instruments?: string[]
    reagents?: Array<{ name: string; amount?: string }>
    observations?: string
  }) => Promise<void>
  stopRecording: (success: boolean, notes?: string) => Promise<void>
  addExperimentData: (key: string, value: unknown) => Promise<void>
}

export function useBackendExperimentRecorder({
  experimentType,
  title,
  totalSteps,
}: UseBackendExperimentRecorderProps): UseBackendExperimentRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentExperiment, setCurrentExperiment] = useState<BackendExperimentRecord | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [steps, setSteps] = useState<BackendStepRecord[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const startRecording = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Please login to record experiments')
    }
    
    setIsLoading(true)
    try {
      const experiment = await experimentApi.create({
        experiment_type: experimentType,
        title,
        total_steps: totalSteps,
      })
      
      setCurrentExperiment(experiment)
      setStartTime(new Date(experiment.started_at))
      setSteps([])
      setCurrentStepIndex(0)
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start experiment:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [experimentType, title, totalSteps, isAuthenticated])

  const completeStep = useCallback(async (
    stepName: string,
    data?: {
      description?: string
      instruments?: string[]
      reagents?: Array<{ name: string; amount?: string }>
      observations?: string
    }
  ) => {
    if (!currentExperiment || !isRecording) return
    
    setIsLoading(true)
    try {
      const stepNumber = currentStepIndex + 1
      await experimentApi.addStep(currentExperiment.id, {
        step_number: stepNumber,
        step_name: stepName,
        description: data?.description,
        instruments_used: data?.instruments || [],
        reagents_used: data?.reagents || [],
        observations: data?.observations,
      })
      
      // Refresh experiment to get updated steps
      const updated = await experimentApi.get(currentExperiment.id)
      setCurrentExperiment(updated)
      setSteps(updated.steps)
      setCurrentStepIndex(stepNumber)
    } catch (error) {
      console.error('Failed to complete step:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentExperiment, currentStepIndex, isRecording])

  const addExperimentData = useCallback(async (key: string, value: unknown) => {
    if (!currentExperiment) return
    
    try {
      const newData = { ...currentExperiment.data, [key]: value }
      await experimentApi.update(currentExperiment.id, { data: newData })
      
      const updated = await experimentApi.get(currentExperiment.id)
      setCurrentExperiment(updated)
    } catch (error) {
      console.error('Failed to add experiment data:', error)
      throw error
    }
  }, [currentExperiment])

  const stopRecording = useCallback(async (success: boolean, notes?: string) => {
    if (!currentExperiment || !isRecording) return
    
    setIsLoading(true)
    try {
      await experimentApi.update(currentExperiment.id, {
        status: success ? 'completed' : 'failed',
        notes,
      })
      
      const updated = await experimentApi.get(currentExperiment.id)
      setCurrentExperiment(updated)
      setIsRecording(false)
    } catch (error) {
      console.error('Failed to stop experiment:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentExperiment, isRecording])

  return {
    isRecording,
    isLoading,
    currentExperiment,
    startTime,
    steps,
    currentStepIndex,
    startRecording,
    completeStep,
    stopRecording,
    addExperimentData,
  }
}

// Hook for fetching all experiments from backend
export function useBackendExperiments() {
  const [records, setRecords] = useState<BackendExperimentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const fetchExperiments = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await experimentApi.list({ limit: 100 })
      setRecords(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch experiments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setRecords([])
      setIsLoading(false)
      return
    }

    fetchExperiments()
  }, [isAuthenticated, fetchExperiments])

  return { records, isLoading, error, refetch: fetchExperiments }
}

// Hook for fetching a single experiment from backend
export function useBackendExperiment(id: number | null) {
  const [record, setRecord] = useState<BackendExperimentRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!id || !isAuthenticated) {
      setRecord(null)
      return
    }
    
    const fetchExperiment = async () => {
      try {
        setIsLoading(true)
        const data = await experimentApi.get(id)
        setRecord(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch experiment')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchExperiment()
  }, [id, isAuthenticated])

  return { record, isLoading, error }
}
