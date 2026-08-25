import { create } from 'zustand'

export interface SelectedInstrument {
  id: string
  name: string
  icon: string
}

export interface SelectedReagent {
  id: string
  name: string
  formula: string
  quantity?: string
}

interface ExperimentState {
  currentExperimentId: string | null
  selectedInstruments: SelectedInstrument[]
  selectedReagents: SelectedReagent[]
  currentStepIndex: number
  experimentStatus: 'idle' | 'running' | 'completed' | 'error'
  
  setCurrentExperiment: (id: string) => void
  addInstrument: (instrument: SelectedInstrument) => void
  removeInstrument: (id: string) => void
  addReagent: (reagent: SelectedReagent) => void
  removeReagent: (id: string) => void
  setStepIndex: (index: number) => void
  setExperimentStatus: (status: ExperimentState['experimentStatus']) => void
  resetExperiment: () => void
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  currentExperimentId: null,
  selectedInstruments: [],
  selectedReagents: [],
  currentStepIndex: 0,
  experimentStatus: 'idle',
  
  setCurrentExperiment: (id) => set({ currentExperimentId: id }),
  
  addInstrument: (instrument) => {
    set((state) => ({
      selectedInstruments: [...state.selectedInstruments, instrument],
    }))
  },
  
  removeInstrument: (id) => {
    set((state) => ({
      selectedInstruments: state.selectedInstruments.filter((i) => i.id !== id),
    }))
  },
  
  addReagent: (reagent) => {
    set((state) => ({
      selectedReagents: [...state.selectedReagents, reagent],
    }))
  },
  
  removeReagent: (id) => {
    set((state) => ({
      selectedReagents: state.selectedReagents.filter((r) => r.id !== id),
    }))
  },
  
  setStepIndex: (index) => set({ currentStepIndex: index }),
  
  setExperimentStatus: (status) => set({ experimentStatus: status }),
  
  resetExperiment: () => {
    set({
      selectedInstruments: [],
      selectedReagents: [],
      currentStepIndex: 0,
      experimentStatus: 'idle',
    })
  },
}))
