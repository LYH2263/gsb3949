import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { reagents, reagentCategories, reagentIncompatibilities, type ReagentCategory } from '../../data/reagents'
import type { Reagent } from '../../types/reagent'
import { useUIStore } from '../../store'
import { Search, Info, Check, AlertTriangle, Droplets } from 'lucide-react'

interface ReagentPanelProps {
  selectedReagents: Array<{ id: string; name: string; formula: string }>
  onSelect: (reagent: Reagent) => void
  onDeselect: (reagentId: string) => void
  readOnly?: boolean
}

export default function ReagentPanel({ 
  selectedReagents, 
  onSelect, 
  onDeselect,
  readOnly = false 
}: ReagentPanelProps) {
  const [activeCategory, setActiveCategory] = useState<ReagentCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReagent, setSelectedReagent] = useState<Reagent | null>(null)
  const { addToast } = useUIStore()

  const filteredReagents = useMemo(() => {
    let result = reagents
    
    if (activeCategory !== 'all') {
      result = result.filter(r => r.category === activeCategory)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.formula.toLowerCase().includes(query)
      )
    }
    
    return result
  }, [activeCategory, searchQuery])

  const isSelected = (id: string) => selectedReagents.some(r => r.id === id)

  const checkCompatibility = (reagent: Reagent): boolean => {
    const selectedIds = selectedReagents.map(r => r.id)
    
    for (const incompatibility of reagentIncompatibilities) {
      const [r1, r2] = incompatibility.reagents
      if ((reagent.id === r1 && selectedIds.includes(r2)) ||
          (reagent.id === r2 && selectedIds.includes(r1))) {
        addToast({
          type: 'warning',
          title: '⚠️ 试剂兼容性警告',
          message: `${reagent.name} 与已选试剂${incompatibility.reason}，请注意安全`,
        })
        return false
      }
    }
    return true
  }

  const handleReagentClick = (reagent: Reagent) => {
    if (readOnly) return
    
    if (isSelected(reagent.id)) {
      onDeselect(reagent.id)
    } else {
      checkCompatibility(reagent)
      onSelect(reagent)
    }
  }

  const getCategoryColor = (categoryId: string) => {
    const cat = reagentCategories.find(c => c.id === categoryId)
    return cat?.color || 'bg-slate-500'
  }

  const getCategoryName = (categoryId: string) => {
    const cat = reagentCategories.find(c => c.id === categoryId)
    return cat?.name || categoryId
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-900 mb-3">化学试剂</h3>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索试剂名称或化学式..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {reagentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? `${cat.color} text-white`
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reagents List */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          {filteredReagents.map((reagent) => (
            <motion.button
              key={reagent.id}
              onClick={() => handleReagentClick(reagent)}
              whileHover={{ scale: readOnly ? 1 : 1.01 }}
              whileTap={{ scale: readOnly ? 1 : 0.99 }}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                isSelected(reagent.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 hover:border-primary-300 bg-white'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className={`w-12 h-12 rounded-xl ${getCategoryColor(reagent.category)} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                <Droplets className={`w-6 h-6 ${getCategoryColor(reagent.category).replace('bg-', 'text-')}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 truncate">{reagent.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getCategoryColor(reagent.category)}`}>
                    {getCategoryName(reagent.category)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-mono">{reagent.formula}</p>
                {reagent.concentration && (
                  <p className="text-xs text-slate-400">{reagent.concentration}</p>
                )}
              </div>

              {isSelected(reagent.id) ? (
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedReagent(reagent)
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              )}
            </motion.button>
          ))}
        </div>

        {filteredReagents.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Droplets className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>未找到匹配的试剂</p>
          </div>
        )}
      </div>

      {/* Selected Count */}
      {selectedReagents.length > 0 && (
        <div className="px-4 py-3 bg-primary-50 border-t border-primary-100">
          <p className="text-sm text-primary-700">
            已选择 <span className="font-bold">{selectedReagents.length}</span> 种试剂
          </p>
        </div>
      )}

      {/* Reagent Detail Modal */}
      <AnimatePresence>
        {selectedReagent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReagent(null)}
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
                  <div className={`w-16 h-16 rounded-xl ${getCategoryColor(selectedReagent.category)} bg-opacity-20 flex items-center justify-center`}>
                    <Droplets className={`w-8 h-8 ${getCategoryColor(selectedReagent.category).replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedReagent.name}</h3>
                    <p className="text-lg text-primary-600 font-mono">{selectedReagent.formula}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${getCategoryColor(selectedReagent.category)}`}>
                      {getCategoryName(selectedReagent.category)}
                    </span>
                    <span className="text-sm text-slate-500">{selectedReagent.state === 'solid' ? '固体' : '液体'}</span>
                    <span className="text-sm text-slate-500">{selectedReagent.color}</span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">物理性质</h4>
                    <p className="text-slate-600 text-sm">{selectedReagent.properties}</p>
                  </div>

                  {selectedReagent.concentration && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">浓度</h4>
                      <p className="text-slate-600 text-sm">{selectedReagent.concentration}</p>
                    </div>
                  )}

                  <div className="bg-danger-light rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-danger" />
                      <h4 className="font-semibold text-danger-dark">安全注意事项</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-danger-dark">
                      {selectedReagent.hazards.map((h, i) => (
                        <li key={i}>• {h}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedReagent(null)
                      if (!readOnly && !isSelected(selectedReagent.id)) {
                        checkCompatibility(selectedReagent)
                        onSelect(selectedReagent)
                      }
                    }}
                    disabled={readOnly || isSelected(selectedReagent.id)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSelected(selectedReagent.id) ? '已选择' : '添加到实验台'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedReagent(null)}
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
