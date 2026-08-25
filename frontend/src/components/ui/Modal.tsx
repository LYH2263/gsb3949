import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { X } from 'lucide-react'

export default function ModalContainer() {
  const { modal, closeModal } = useUIStore()

  if (!modal) return null

  return (
    <AnimatePresence>
      {modal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">{modal.title}</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto">
                {modal.content}
              </div>

              {/* Actions */}
              {modal.actions && modal.actions.length > 0 && (
                <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
                  {modal.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={action.onClick}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        action.variant === 'danger'
                          ? 'bg-danger text-white hover:bg-danger-dark'
                          : action.variant === 'secondary'
                          ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
