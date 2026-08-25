import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactionRule } from '../../types/reaction'

interface ReactionVisualizerProps {
  reaction: ReactionRule | null
  isActive: boolean
  onComplete?: () => void
}

export default function ReactionVisualizer({ 
  reaction, 
  isActive,
  onComplete 
}: ReactionVisualizerProps) {
  const [currentPhenomenonIndex, setCurrentPhenomenonIndex] = useState(0)
  const [showEquation, setShowEquation] = useState(false)

  useEffect(() => {
    if (isActive && reaction) {
      // Show phenomena sequentially
      const phenomenaCount = reaction.phenomena.length
      let index = 0
      
      const interval = setInterval(() => {
        if (index < phenomenaCount) {
          setCurrentPhenomenonIndex(index)
          index++
        } else {
          setShowEquation(true)
          clearInterval(interval)
          if (onComplete) {
            setTimeout(onComplete, 2000)
          }
        }
      }, 1500)

      return () => clearInterval(interval)
    }
  }, [isActive, reaction, onComplete])

  if (!reaction || !isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p>等待反应发生...</p>
      </div>
    )
  }

  const currentPhenomenon = reaction.phenomena[currentPhenomenonIndex]

  return (
    <div className="relative w-full h-full min-h-[300px] flex flex-col items-center justify-center">
      {/* Background Effect */}
      <AnimatePresence>
        {currentPhenomenon?.type === 'gas_evolution' && (
          <BubbleEffect intensity={currentPhenomenon.intensity} />
        )}
      </AnimatePresence>

      {/* Main Visualization */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl mb-4"
        >
          🧪
        </motion.div>

        {/* Reaction Name */}
        <motion.h3
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xl font-bold text-slate-900 mb-2"
        >
          {reaction.name}
        </motion.h3>

        {/* Current Phenomenon */}
        <AnimatePresence mode="wait">
          {currentPhenomenon && (
            <motion.div
              key={currentPhenomenonIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`px-6 py-3 rounded-xl mb-4 ${
                currentPhenomenon.type === 'temperature_change'
                  ? 'bg-orange-100 text-orange-800'
                  : currentPhenomenon.type === 'gas_evolution'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              <p className="text-lg font-medium">
                {getPhenomenonIcon(currentPhenomenon.type)} {currentPhenomenon.description}
              </p>
              <p className="text-sm opacity-75 mt-1">
                强度: {getIntensityText(currentPhenomenon.intensity)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chemical Equation */}
        <AnimatePresence>
          {showEquation && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 p-4 bg-slate-800 text-white rounded-xl"
            >
              <p className="text-sm text-slate-400 mb-1">化学方程式</p>
              <p className="text-xl font-mono">{reaction.equation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {reaction.phenomena.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index <= currentPhenomenonIndex
                  ? 'bg-primary-500 w-4'
                  : 'bg-slate-300'
              }`}
            />
          ))}
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              showEquation ? 'bg-success w-4' : 'bg-slate-300'
            }`}
          />
        </div>
      </div>
    </div>
  )
}

// Bubble Effect Component
function BubbleEffect({ intensity }: { intensity: string }) {
  const bubbleCount = intensity === 'very_strong' ? 20 : intensity === 'strong' ? 12 : 6
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: bubbleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-blue-400/30 rounded-full"
          initial={{
            x: Math.random() * 100 + '%',
            y: '100%',
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: '-20%',
            x: `${Math.random() * 100}%`,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// Helper functions
function getPhenomenonIcon(type: string): string {
  const icons: Record<string, string> = {
    temperature_change: '🌡️',
    gas_evolution: '💨',
    color_change: '🎨',
    precipitation: '🌫️',
    dissolution: '💧',
  }
  return icons[type] || '✨'
}

function getIntensityText(intensity: string): string {
  const texts: Record<string, string> = {
    mild: '轻微',
    moderate: '中等',
    strong: '明显',
    very_strong: '剧烈',
  }
  return texts[intensity] || intensity
}
