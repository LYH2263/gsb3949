import Dexie, { Table } from 'dexie'

export interface ExperimentRecord {
  id?: number
  experimentId: string
  experimentName: string
  category: string
  startTime: Date
  endTime: Date
  duration: number // seconds
  steps: StepRecord[]
  selectedInstruments: { id: string; name: string; icon: string }[]
  selectedReagents: { id: string; name: string; formula: string }[]
  phenomena: string[]
  result: {
    success: boolean
    completedSteps: number
    totalSteps: number
    conclusion: string
  }
  dataPoints: DataPoint[]
  notes?: string
}

export interface StepRecord {
  stepId: string
  stepName: string
  startTime: Date
  endTime: Date
  duration: number // seconds
  completed: boolean
  phenomena?: string[]
}

export interface DataPoint {
  timestamp: number
  stepId?: string
  type: 'temperature' | 'ph' | 'volume' | 'time' | 'observation'
  value: number | string
  unit?: string
  description?: string
}

class ChemLabDB extends Dexie {
  records!: Table<ExperimentRecord>

  constructor() {
    super('ChemLabDB')
    this.version(1).stores({
      records: '++id, experimentId, startTime, category',
    })
  }
}

export const db = new ChemLabDB()

// Helper functions for record management
export async function saveExperimentRecord(record: Omit<ExperimentRecord, 'id'>): Promise<number> {
  return await db.records.add(record as ExperimentRecord)
}

export async function getAllRecords(): Promise<ExperimentRecord[]> {
  return await db.records.orderBy('startTime').reverse().toArray()
}

export async function getRecordsByExperiment(experimentId: string): Promise<ExperimentRecord[]> {
  return await db.records
    .where('experimentId')
    .equals(experimentId)
    .reverse()
    .sortBy('startTime')
}

export async function getRecordById(id: number): Promise<ExperimentRecord | undefined> {
  return await db.records.get(id)
}

export async function deleteRecord(id: number): Promise<void> {
  await db.records.delete(id)
}

export async function updateRecord(id: number, changes: Partial<ExperimentRecord>): Promise<void> {
  await db.records.update(id, changes)
}

export async function exportRecordToJSON(id: number): Promise<string> {
  const record = await getRecordById(id)
  if (!record) throw new Error('Record not found')
  
  return JSON.stringify(record, null, 2)
}

export async function getExperimentStats(): Promise<{
  totalExperiments: number
  totalDuration: number
  successRate: number
  byCategory: Record<string, number>
}> {
  const records = await getAllRecords()
  
  const totalExperiments = records.length
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0)
  const successfulExperiments = records.filter(r => r.result.success).length
  const successRate = totalExperiments > 0 ? (successfulExperiments / totalExperiments) * 100 : 0
  
  const byCategory: Record<string, number> = {}
  records.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1
  })
  
  return {
    totalExperiments,
    totalDuration,
    successRate,
    byCategory,
  }
}
