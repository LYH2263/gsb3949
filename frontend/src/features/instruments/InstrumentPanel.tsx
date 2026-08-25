import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { instruments, instrumentCategories, type InstrumentCategory } from '../../data/instruments'
import type { Instrument } from '../../types/instrument'
import { Info, Check, AlertTriangle } from 'lucide-react'

interface InstrumentPanelProps {
  selectedInstruments: string[]
  onSelect: (instrument: Instrument) => void
  onDeselect: (instrumentId: string) => void
  readOnly?: boolean
}

export default function InstrumentPanel({ 
  selectedInstruments, 
  onSelect, 
  onDeselect,
  readOnly = false 
}: InstrumentPanelProps) {
  const [activeCategory, setActiveCategory] = useState<InstrumentCategory>('all')
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null)
  
  const filteredInstruments = activeCategory === 'all' 
    ? instruments 
    : instruments.filter(i => i.category === activeCategory)

  const isSelected = (id: string) => selectedInstruments.includes(id)

  const handleInstrumentClick = (instrument: Instrument) => {
    if (readOnly) return
    
    if (isSelected(instrument.id)) {
      onDeselect(instrument.id)
    } else {
      onSelect(instrument)
      setSelectedInstrument(instrument)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-900 mb-3">实验器材</h3>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {instrumentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Instruments Grid */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {filteredInstruments.map((instrument) => (
            <motion.button
              key={instrument.id}
              onClick={() => handleInstrumentClick(instrument)}
              whileHover={{ scale: readOnly ? 1 : 1.02 }}
              whileTap={{ scale: readOnly ? 1 : 0.98 }}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected(instrument.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 hover:border-primary-300 bg-white'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{instrument.icon}</span>
                {isSelected(instrument.id) && (
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <p className="font-semibold text-slate-900 text-sm">{instrument.name}</p>
              
              {instrument.capacity && (
                <p className="text-xs text-slate-500 mt-1">{instrument.capacity}</p>
              )}
              
              {!readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedInstrument(instrument)
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Count */}
      {selectedInstruments.length > 0 && (
        <div className="px-4 py-3 bg-primary-50 border-t border-primary-100">
          <p className="text-sm text-primary-700">
            已选择 <span className="font-bold">{selectedInstruments.length}</span> 件器材
          </p>
        </div>
      )}

      {/* Instrument Detail Modal */}
      <AnimatePresence>
        {selectedInstrument && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInstrument(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{selectedInstrument.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedInstrument.name}</h3>
                    {selectedInstrument.capacity && (
                      <p className="text-slate-500">{selectedInstrument.capacity}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">用途</h4>
                    <p className="text-slate-600 text-sm">{selectedInstrument.description}</p>
                  </div>

                  <div className="bg-warning-light rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <h4 className="font-semibold text-warning-dark">使用注意事项</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-warning-dark">
                      {selectedInstrument.precautions.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedInstrument(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
