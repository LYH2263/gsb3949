export interface Instrument {
  id: string
  name: string
  category: 'container' | 'heating' | 'measuring' | 'auxiliary'
  icon: string
  description: string
  precautions: string[]
  capacity?: string
}
